import tornado.web
import tornado.ioloop
from handlers import *
import os
import base64
import uuid


if __name__ == "__main__":
    cookie_secret = base64.b64encode(uuid.uuid4().bytes + uuid.uuid4().bytes)
    settings = { "static_path" : os.path.join(os.path.dirname(__file__), "static"), "login_url": "/admin-login", "cookie_secret" : cookie_secret}
    application = tornado.web.Application([
        (r"/", MainHandler), 
        (r"/realtime-simulation", RealtimeSimulationHandler),
        (r"/realtimeSocket", RealtimeSimulationSocketHandler),
        (r"/practice-simulation-individual", PracticeSimulationHandler),
        (r"/practice-simulation-team", PracticeTeamSimulationHandler),
        (r"/feedback", FeedbackHandler),
        (r"/contact", ContactHandler),
        (r'/(favicon.ico)', tornado.web.StaticFileHandler, {"path": "favicon.ico"}),
        (r"/data", DataHandler),
        (r"/admin-login", AdminLoginHandler),
        (r"/admin", AdminHandler),
        (r"/income-statement", IncomeStatementHandler),
        (r"/tutorial", DetailsHandler),
        ], debug = True, **settings)
    application.listen(80)
    tornado.ioloop.IOLoop.instance().start()