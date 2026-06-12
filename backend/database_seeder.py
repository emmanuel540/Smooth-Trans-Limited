import os
import sys
import random
import math
from datetime import datetime, timedelta, date

# Add parent directory to path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.app import create_app
from backend.models import db, User, DriverProfile, Vehicle, Booking, Payment, MaintenanceLog, Notification

def seed_database():
    app = create_app()
    with app.app_context():
        print("Wiping database...")
        db.drop_all()
        db.create_all()

        print("Seeding users...")
        
        # 1. Admin
        admin = User(name="Emmanuel Admin", email="admin@smooth.co.ke", role="admin", phone="0711222333", is_verified=True)
        admin.set_password("password123")
        db.session.add(admin)

        # 2. Dispatcher
        dispatcher = User(name="Jane Dispatcher", email="dispatcher@smooth.co.ke", role="dispatcher", phone="0722333444", is_verified=True)
        dispatcher.set_password("password123")
        db.session.add(dispatcher)

        # 3. Drivers
        driver_details = [
            ("John Kamau", "driver1@smooth.co.ke", "0733444555", "DL-83921A"),
            ("Peter Omondi", "driver2@smooth.co.ke", "0744555666", "DL-92831B"),
            ("Alice Mwangi", "driver3@smooth.co.ke", "0755666777", "DL-12938C"),
            ("David Mutua", "driver4@smooth.co.ke", "0766777888", "DL-57482D"),
            ("Grace Kiprop", "driver5@smooth.co.ke", "0777888999", "DL-48293E")
        ]
        
        drivers_list = []
        for name, email, phone, license_no in driver_details:
            d_user = User(name=name, email=email, role="driver", phone=phone, is_verified=True)
            d_user.set_password("password123")
            db.session.add(d_user)
            drivers_list.append((d_user, license_no))

        # 4. Passengers
        passenger_details = [
            ("Alex Mercer", "alex@gmail.com", "0700111222"),
            ("Sarah Connor", "sarah@gmail.com", "0700222333"),
            ("Bruce Wayne", "bruce@gmail.com", "0700333444"),
            ("Diana Prince", "diana@gmail.com", "0700444555"),
            ("Clark Kent", "clark@gmail.com", "0700555666")
        ]
        passengers_list = []
        for name, email, phone in passenger_details:
            p_user = User(name=name, email=email, role="passenger", phone=phone, is_verified=True)
            p_user.set_password("password123")
            db.session.add(p_user)
            passengers_list.append(p_user)

        db.session.flush() # Flush to obtain user IDs

        print("Seeding vehicles...")
        # 10 Vehicles of various types
        vehicle_details = [
            # plate, make, model, year, type, status, mileage, fuel, avg_con, last_service
            ("KCB 123A", "Toyota", "Hiace (Matatu)", 2018, "Transport", "Active", 120450.0, 75.0, 11.5, 118000.0),
            ("KCC 456B", "Nissan", "Caravan", 2017, "Transport", "Active", 145200.0, 80.0, 10.8, 142000.0),
            ("KCD 789C", "Toyota", "Coaster Bus", 2019, "SchoolBus", "Active", 65300.0, 95.0, 14.5, 62000.0),
            ("KCE 101D", "Isuzu", "NQR School Bus", 2021, "SchoolBus", "Active", 35400.0, 60.0, 18.0, 30000.0),
            ("KCF 202E", "Toyota", "Probox Delivery", 2016, "DeliveryVan", "Active", 210800.0, 45.0, 8.2, 208000.0),
            ("KCG 303F", "Nissan", "NV200 Van", 2018, "DeliveryVan", "Active", 98400.0, 90.0, 7.8, 95000.0),
            ("KCH 404G", "Mitsubishi", "Fuso 3-Ton Truck", 2015, "MovingTruck", "Active", 185300.0, 50.0, 22.0, 184500.0),
            ("KCI 505H", "Isuzu", "FRR 5-Ton Truck", 2020, "MovingTruck", "Active", 54200.0, 85.0, 24.5, 50000.0),
            ("KCJ 606I", "Toyota", "Fielder Eco", 2020, "Transport", "Active", 45000.0, 10.0, 6.5, 40000.0), # Low fuel to test predictive warning
            ("KCK 707J", "Isuzu", "NQR Medium Truck", 2016, "MovingTruck", "Maintenance", 230500.0, 40.0, 19.5, 225000.0), # In maintenance
        ]
        vehicles_list = []
        for plate, make, model, yr, v_type, status, mil, fuel, avg, last_s in vehicle_details:
            veh = Vehicle(
                plate_number=plate, make=make, model=model, year=yr, type=v_type,
                status=status, mileage=mil, fuel_level=fuel, avg_fuel_consumption=avg,
                last_service_mileage=last_s
            )
            db.session.add(veh)
            vehicles_list.append(veh)

        db.session.flush() # Flush to get vehicle IDs

        print("Seeding driver profiles...")
        # Assign first 5 vehicles to the 5 drivers
        for i, (driver_user, license_no) in enumerate(drivers_list):
            assigned_vehicle = vehicles_list[i]
            driver_profile = DriverProfile(
                user_id=driver_user.id,
                license_number=license_no,
                license_expiry=date(2028, 5, 20),
                status="Available" if assigned_vehicle.status == "Active" else "Offline",
                rating=4.5 + (i * 0.1), # ratings: 4.5, 4.6, 4.7, 4.8, 4.9
                vehicle_id=assigned_vehicle.id
            )
            db.session.add(driver_profile)

        # Seeding maintenance logs for the vehicle in maintenance
        m_log = MaintenanceLog(
            vehicle_id=vehicles_list[9].id, # KCK 707J
            description="Exhaust smoke check and replacement of fuel filters due to high consumption spike.",
            cost=12500.0,
            service_date=datetime.utcnow().date() - timedelta(days=1),
            current_mileage=230500.0
        )
        db.session.add(m_log)

        # Nairobi area locations for booking simulation
        # Coords format: (Name, lat, lng)
        nairobi_locs = [
            ("Nairobi CBD", -1.2921, 36.8219),
            ("Westlands", -1.2682, 36.8055),
            ("Kilimani", -1.2902, 36.7865),
            ("Karen", -1.3201, 36.7050),
            ("Langata", -1.3323, 36.7681),
            ("Eastleigh", -1.2789, 36.8489),
            ("South C", -1.3175, 36.8290),
            ("Gikomba", -1.2905, 36.8370),
            ("Industrial Area", -1.3115, 36.8520),
            ("Ngong Road", -1.3010, 36.7640)
        ]

        print("Seeding bookings and payments history...")
        # Create historical bookings over past 10 days to fill the charts
        now = datetime.utcnow()
        booking_types = ['General', 'School', 'Delivery', 'Moving']
        payment_methods = ['MPesa', 'Card']
        
        # We need a list of driver profiles that have active vehicles
        available_driver_profiles = DriverProfile.query.all()

        for d in range(12): # 12 days ago to yesterday
            booking_date = now - timedelta(days=d)
            # Create 3-4 bookings per day
            for _ in range(random.randint(3, 4)):
                p_user = random.choice(passengers_list)
                b_type = random.choice(booking_types)
                loc_start = random.choice(nairobi_locs)
                loc_end = random.choice([l for l in nairobi_locs if l[0] != loc_start[0]])
                
                # Math distance
                dist = math.sqrt((loc_end[1] - loc_start[1])**2 + (loc_end[2] - loc_start[2])**2) * 111.0
                
                # Fares
                rates = {
                    'General': {'base': 150, 'per_km': 50},
                    'School': {'base': 1000, 'per_km': 30},
                    'Delivery': {'base': 100, 'per_km': 40},
                    'Moving': {'base': 3000, 'per_km': 150}
                }
                type_rate = rates.get(b_type, rates['General'])
                fare = round(type_rate['base'] + (dist * type_rate['per_km']), -1)

                # Assign random driver/vehicle from our drivers
                assigned_d = random.choice(available_driver_profiles)
                
                # Historical booking is mostly Completed, some Cancelled
                status_choices = ['Completed', 'Completed', 'Completed', 'Cancelled']
                b_status = random.choice(status_choices)

                # Set booking time to random hour on that day
                trip_time = datetime(
                    booking_date.year, booking_date.month, booking_date.day,
                    random.randint(6, 21), random.randint(0, 59), random.randint(0, 59)
                )

                booking = Booking(
                    customer_id=p_user.id,
                    driver_id=assigned_d.user_id,
                    vehicle_id=assigned_d.vehicle_id,
                    booking_type=b_type,
                    pickup_address=loc_start[0],
                    dropoff_address=loc_end[0],
                    pickup_lat=loc_start[1],
                    pickup_lng=loc_start[2],
                    dropoff_lat=loc_end[1],
                    dropoff_lng=loc_end[2],
                    pickup_time=trip_time,
                    fare=fare,
                    status=b_status,
                    created_at=trip_time
                )
                db.session.add(booking)
                db.session.flush()

                # Add payments
                if b_status == 'Completed':
                    invoice_no = f"INV-{booking.id}-{random.randint(1000, 9999)}"
                    payment = Payment(
                        booking_id=booking.id,
                        amount=fare,
                        payment_method=random.choice(payment_methods),
                        status='Completed',
                        transaction_id=f"TXN{random.randint(100000000, 999999999)}",
                        invoice_no=invoice_no,
                        created_at=trip_time
                    )
                    db.session.add(payment)
                elif b_status == 'Cancelled' and random.random() < 0.2:
                    invoice_no = f"INV-{booking.id}-{random.randint(1000, 9999)}"
                    payment = Payment(
                        booking_id=booking.id,
                        amount=fare,
                        payment_method=random.choice(payment_methods),
                        status='Failed',
                        invoice_no=invoice_no,
                        created_at=trip_time
                    )
                    db.session.add(payment)

        # Create 3 live bookings for today: 1 Pending, 1 Assigned, 1 Active (In Transit)
        # 1. Pending Booking
        pending_b = Booking(
            customer_id=passengers_list[0].id,
            booking_type="General",
            pickup_address="Westlands",
            dropoff_address="Nairobi CBD",
            pickup_lat=-1.2682,
            pickup_lng=36.8055,
            dropoff_lat=-1.2921,
            dropoff_lng=36.8219,
            pickup_time=now + timedelta(minutes=30),
            fare=250.0,
            status="Pending",
            created_at=now - timedelta(minutes=10)
        )
        db.session.add(pending_b)
        db.session.flush()
        db.session.add(Payment(
            booking_id=pending_b.id,
            amount=250.0,
            payment_method="MPesa",
            status="Pending",
            invoice_no=f"INV-{pending_b.id}-8391",
            created_at=now - timedelta(minutes=10)
        ))

        # 2. Assigned Booking
        assigned_driver = available_driver_profiles[1] # Peter Omondi
        assigned_driver.status = "Active"
        assigned_b = Booking(
            customer_id=passengers_list[1].id,
            driver_id=assigned_driver.user_id,
            vehicle_id=assigned_driver.vehicle_id,
            booking_type="Delivery",
            pickup_address="Kilimani",
            dropoff_address="Industrial Area",
            pickup_lat=-1.2902,
            pickup_lng=36.7865,
            dropoff_lat=-1.3115,
            dropoff_lng=36.8520,
            pickup_time=now + timedelta(minutes=15),
            fare=450.0,
            status="Assigned",
            created_at=now - timedelta(minutes=20)
        )
        db.session.add(assigned_b)
        db.session.flush()
        db.session.add(Payment(
            booking_id=assigned_b.id,
            amount=450.0,
            payment_method="Card",
            status="Completed",
            transaction_id=f"TXN{random.randint(100000000, 999999999)}",
            invoice_no=f"INV-{assigned_b.id}-9402",
            created_at=now - timedelta(minutes=20)
        ))

        # 3. Active Booking (In Transit)
        active_driver = available_driver_profiles[0] # John Kamau
        active_driver.status = "Active"
        active_b = Booking(
            customer_id=passengers_list[2].id,
            driver_id=active_driver.user_id,
            vehicle_id=active_driver.vehicle_id,
            booking_type="Moving",
            pickup_address="Karen",
            dropoff_address="Langata",
            pickup_lat=-1.3201,
            pickup_lng=36.7050,
            dropoff_lat=-1.3323,
            dropoff_lng=36.7681,
            pickup_time=now - timedelta(minutes=10),
            fare=3200.0,
            status="Active",
            created_at=now - timedelta(minutes=30)
        )
        db.session.add(active_b)
        db.session.flush()
        db.session.add(Payment(
            booking_id=active_b.id,
            amount=3200.0,
            payment_method="MPesa",
            status="Completed",
            transaction_id=f"TXN{random.randint(100000000, 999999999)}",
            invoice_no=f"INV-{active_b.id}-2039",
            created_at=now - timedelta(minutes=30)
        ))

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
