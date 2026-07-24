import os
import sys
import csv
from datetime import datetime

# Add parent directory to sys.path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.app import create_app
from backend.models import db, Vehicle, DriverProfile

DEFAULT_CSV_PATH = r"C:\Users\Emmanuel\Downloads\fleet_report_2026-06-12.csv"

# Average fuel consumption defaults based on vehicle type (liters per 100km)
AVG_FUEL_CONSUMPTION_DEFAULTS = {
    'Transport': 11.0,
    'SchoolBus': 16.0,
    'DeliveryVan': 8.0,
    'MovingTruck': 22.0
}

def import_vehicles_from_csv(csv_filepath=DEFAULT_CSV_PATH):
    if not os.path.exists(csv_filepath):
        print(f"Error: CSV file not found at {csv_filepath}")
        return False

    app = create_app()
    with app.app_context():
        print(f"Importing vehicles from {csv_filepath}...")
        
        imported_count = 0
        updated_count = 0

        with open(csv_filepath, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # Strip keys and values
                clean_row = {k.strip(): v.strip() for k, v in row.items() if k}
                
                plate_number = clean_row.get('Plate Number')
                make = clean_row.get('Make')
                model = clean_row.get('Model')
                year = clean_row.get('Year')
                v_type = clean_row.get('Type')
                status = clean_row.get('Status', 'Active')
                mileage_str = clean_row.get('Mileage (km)', '0')
                fuel_str = clean_row.get('Fuel Level (%)', '100')

                if not plate_number or not make or not model or not year or not v_type:
                    print(f"Skipping incomplete row: {clean_row}")
                    continue

                year_int = int(year)
                mileage_float = float(mileage_str)
                fuel_float = float(fuel_str)
                avg_fuel = AVG_FUEL_CONSUMPTION_DEFAULTS.get(v_type, 10.0)
                last_service = max(0.0, mileage_float - 3000.0)

                existing_vehicle = Vehicle.query.filter_by(plate_number=plate_number).first()
                if existing_vehicle:
                    existing_vehicle.make = make
                    existing_vehicle.model = model
                    existing_vehicle.year = year_int
                    existing_vehicle.type = v_type
                    existing_vehicle.status = status
                    existing_vehicle.mileage = mileage_float
                    existing_vehicle.fuel_level = fuel_float
                    updated_count += 1
                    print(f"  [UPDATED] Vehicle {plate_number} ({make} {model})")
                else:
                    new_vehicle = Vehicle(
                        plate_number=plate_number,
                        make=make,
                        model=model,
                        year=year_int,
                        type=v_type,
                        status=status,
                        mileage=mileage_float,
                        fuel_level=fuel_float,
                        avg_fuel_consumption=avg_fuel,
                        last_service_mileage=last_service
                    )
                    db.session.add(new_vehicle)
                    imported_count += 1
                    print(f"  [INSERTED] Vehicle {plate_number} ({make} {model})")

        db.session.commit()
        print(f"\nImport finished! {imported_count} new vehicles added, {updated_count} vehicles updated.")

        # Assign available unassigned driver profiles to vehicles
        drivers = DriverProfile.query.all()
        vehicles = Vehicle.query.filter_by(status='Active').order_by(Vehicle.id.asc()).all()
        
        assigned_vehicle_ids = {d.vehicle_id for d in drivers if d.vehicle_id is not None}
        
        assigned_count = 0
        for i, driver in enumerate(drivers):
            if driver.vehicle_id is None or (driver.id > 1 and driver.vehicle_id in assigned_vehicle_ids and list(assigned_vehicle_ids).count(driver.vehicle_id) > 1):
                # Pick an unassigned active vehicle
                for vehicle in vehicles:
                    if vehicle.id not in assigned_vehicle_ids:
                        driver.vehicle_id = vehicle.id
                        assigned_vehicle_ids.add(vehicle.id)
                        assigned_count += 1
                        print(f"  [ASSIGNED] Driver '{driver.user.name if driver.user else driver.id}' -> Vehicle {vehicle.plate_number}")
                        break
        
        # Ensure Driver 1 -> Vehicle 1, Driver 2 -> Vehicle 2
        if len(drivers) >= 2 and len(vehicles) >= 2:
            drivers[0].vehicle_id = vehicles[0].id
            drivers[1].vehicle_id = vehicles[1].id
            
        db.session.commit()
        return True

if __name__ == '__main__':
    csv_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_CSV_PATH
    import_vehicles_from_csv(csv_path)
