"""
Script para poblar la base de datos con datos de ejemplo para testing.

Ejecutar desde la carpeta api/ con el venv activado:
    python seed_data.py
"""

from app.database import SessionLocal, engine
from app.models import Base, Printer, Material, Setting, Product, Client
import sys


def seed_database():
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Verificar si ya hay datos
        if db.query(Printer).count() > 0:
            print("[!] La base de datos ya tiene datos. Limpiando...")
            db.query(Printer).delete()
            db.query(Material).delete()
            db.query(Setting).delete()
            db.query(Product).delete()
            db.query(Client).delete()
            db.commit()

        print("[*] Creando datos de ejemplo...\n")

        # Settings globales (del diseño aprobado)
        settings = [
            Setting(key="cop_kwh", value="839"),
            Setting(key="iva_pct", value="19"),
            Setting(key="margen_default", value="100"),
            Setting(key="labor_rate_cop", value="6470"),
            Setting(key="prep_min", value="5"),
            Setting(key="packaging_cop", value="500"),
        ]
        db.add_all(settings)
        db.commit()
        print("[OK] Settings globales creados")

        # Impresoras (basadas en tu plantilla Excel)
        printers = [
            Printer(
                nombre="Creality Ender 3",
                consumo_w=300,
                precio_maquina=2000000,  # $2.000.000 COP
                vida_util_horas=8760,  # 2 años × 365 días × 6h/día = 4380h, pero pongo 8760 para 1 año uso intensivo
                reparaciones_pct=0.10,  # 10%
                activa=True,
            ),
            Printer(
                nombre="Creality Ender 5",
                consumo_w=350,
                precio_maquina=2500000,
                vida_util_horas=10000,
                reparaciones_pct=0.10,
                activa=True,
            ),
            Printer(
                nombre="Prusa i3 MK3S+",
                consumo_w=280,
                precio_maquina=4500000,
                vida_util_horas=15000,
                reparaciones_pct=0.08,
                activa=True,
            ),
        ]
        db.add_all(printers)
        db.commit()
        print(f"[OK] {len(printers)} impresoras creadas")

        # Materiales (del Excel: PLA $90.000/kg, merma 20%)
        materials = [
            Material(
                nombre="PLA Blanco",
                tipo="PLA",
                cop_por_kg=90000,  # $90.000 COP/kg
                merma_pct=0.20,  # 20% merma
                activa=True,
            ),
            Material(
                nombre="PLA Negro",
                tipo="PLA",
                cop_por_kg=90000,
                merma_pct=0.20,
                activa=True,
            ),
            Material(
                nombre="PLA Bicolor 4D-Lab",
                tipo="PLA",
                cop_por_kg=120000,  # Material premium
                merma_pct=0.20,
                activa=True,
            ),
            Material(
                nombre="PETG Transparente",
                tipo="PETG",
                cop_por_kg=110000,
                merma_pct=0.15,
                activa=True,
            ),
            Material(
                nombre="ABS Negro",
                tipo="ABS",
                cop_por_kg=95000,
                merma_pct=0.25,  # ABS tiene más merma
                activa=True,
            ),
        ]
        db.add_all(materials)
        db.commit()
        print(f"[OK] {len(materials)} materiales creados")

        # Productos (del Excel: llaveros, adaptadores, etc.)
        products = [
            Product(
                sku="LL-001-B",
                nombre="Llavero GatoFlex Short - Blanco",
                categoria="Llaveros",
                precio_venta_cop=10000,
                activa=True,
            ),
            Product(
                sku="LL-001-N",
                nombre="Llavero GatoFlex Short - Negro",
                categoria="Llaveros",
                precio_venta_cop=10000,
                activa=True,
            ),
            Product(
                sku="LL-002-B",
                nombre="Llavero Esqueleto Dragon - Blanco",
                categoria="Llaveros",
                precio_venta_cop=10000,
                activa=True,
            ),
            Product(
                sku="LL-008",
                nombre="Tag Nombre Personalizado",
                categoria="Tags",
                precio_venta_cop=8000,
                activa=True,
            ),
            Product(
                sku="PE-001",
                nombre="Adaptador GoPro Helmet",
                categoria="Accesorios",
                precio_venta_cop=16000,
                activa=True,
            ),
            Product(
                sku="PE-002",
                nombre="Adaptador GoPro AGV K1S",
                categoria="Accesorios",
                precio_venta_cop=32000,
                activa=True,
            ),
            Product(
                sku="INT-001",
                nombre="Rack Filamento 2 puestos",
                categoria="Organizadores",
                precio_venta_cop=17782,
                activa=True,
            ),
        ]
        db.add_all(products)
        db.commit()
        print(f"[OK] {len(products)} productos creados")

        # Clientes de ejemplo
        clients = [
            Client(
                nombre="Cliente Demo 1",
                contacto="demo1@example.com",
                notas="Cliente de prueba para cotizaciones",
            ),
            Client(
                nombre="María González",
                contacto="+57 300 123 4567",
                notas="Cliente frecuente - llaveros personalizados",
            ),
            Client(
                nombre="Carlos Ramírez",
                contacto="carlos.r@email.com",
                notas="Pedidos grandes - accesorios para motos",
            ),
        ]
        db.add_all(clients)
        db.commit()
        print(f"[OK] {len(clients)} clientes creados")

        print("\n[SUCCESS] Base de datos poblada exitosamente!")
        print("\nResumen:")
        print(f"   - {len(settings)} configuraciones globales")
        print(f"   - {len(printers)} impresoras")
        print(f"   - {len(materials)} materiales")
        print(f"   - {len(products)} productos")
        print(f"   - {len(clients)} clientes")
        print("\nAhora puedes probar la calculadora con estos datos.")

    except Exception as e:
        print(f"[ERROR] Error: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
