from app.test.unit import client
def test_landing(client):
    # test without login, should bre redirected
    media = client.get("/media")
    assert media.status_code == 302
