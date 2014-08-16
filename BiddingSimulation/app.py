import tornado.web
import tornado.ioloop
from handlers import *
import os


if __name__ == "__main__":
    settings = { "static_path" : os.path.join(os.path.dirname(__file__), "static")}
    application = tornado.web.Application([
        (r"/", MainHandler), 
        (r"/realtime-simulation", RealtimeSimulationHandler),
        (r"/realtimeSocket", RealtimeSimulationSocketHandler),
        (r"/practice-simulation", PracticeSimulationHandler),
        (r"/feedback", FeedbackHandler),
        (r"/contact", ContactHandler),
        (r'/(favicon.ico)', tornado.web.StaticFileHandler, {"path": "favicon.ico"}),
        (r"/data", DataHandler),
        (r"/admin", AdminHandler),
        (r"/income-statement", IncomeStatementHandler),
        (r"/details", DetailsHandler),
        ], debug = True, **settings)
    application.listen(80)
    tornado.ioloop.IOLoop.instance().start()