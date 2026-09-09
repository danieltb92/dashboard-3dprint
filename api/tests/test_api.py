def printer_payload():
    return {"nombre": "Prusa Mini", "consumo_w": 180, "precio_maquina": 2000000, "vida_util_horas": 10000, "reparaciones_pct": 10, "activa": True}


def material_payload():
    return {"nombre": "PLA Blanco", "tipo": "PLA", "cop_por_kg": 90000, "merma_pct": 20, "activa": True}


def test_health_and_product_crud(client):
    assert client.get("/health").json() == {"status": "ok"}
    payload = {"sku": "TEST-01", "nombre": "Producto prueba", "categoria": "Tests", "precio_venta_cop": 15000, "activa": True}
    created = client.post("/api/products/", json=payload)
    assert created.status_code == 201
    product_id = created.json()["id"]
    assert client.get("/api/products/?activa=true").json()[0]["sku"] == "TEST-01"
    payload["precio_venta_cop"] = 16000
    assert client.put(f"/api/products/{product_id}", json=payload).json()["precio_venta_cop"] == 16000
    assert client.delete(f"/api/products/{product_id}").status_code == 204


def test_lot_calculation_validates_references_and_input(client):
    invalid = {"printer_id": 1, "material_id": 1, "qty": 0, "peso_g": -1, "minutos": -1}
    assert client.post("/api/lots/calculate", json=invalid).status_code == 422
    missing = {"printer_id": 1, "material_id": 1, "qty": 1, "peso_g": 10, "minutos": 30}
    assert client.post("/api/lots/calculate", json=missing).status_code == 404

    printer = client.post("/api/printers/", json=printer_payload()).json()
    material = client.post("/api/materials/", json=material_payload()).json()
    payload = {"printer_id": printer["id"], "material_id": material["id"], "qty": 2, "peso_g": 20, "minutos": 60}
    calculation = client.post("/api/lots/calculate", json=payload)
    assert calculation.status_code == 200
    assert calculation.json()["total_costo"] > 0
    saved = client.post("/api/lots/", json=payload)
    assert saved.status_code == 201
    assert saved.json()["costo_unitario_cop"] == calculation.json()["total_costo"] // 2


def test_client_and_quote_require_valid_client(client):
    quote = {"client_id": 999, "lineas_json": [{"qty": 1}], "subtotal": 1000, "iva": 190, "total": 1190, "estado": "cotizada", "vigencia_dias": 8}
    assert client.post("/api/quotes/", json=quote).status_code == 404
    customer = client.post("/api/clients/", json={"nombre": "Ana", "contacto": "ana@example.test", "notas": None}).json()
    quote["client_id"] = customer["id"]
    assert client.post("/api/quotes/", json=quote).status_code == 201
