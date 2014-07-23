import tornado.websocket
from  jinja2 import Environment, FileSystemLoader

class RealTimeSimulationSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self, *args):
        pass

    def on_message(self, message):        
        """
        when we receive some message we want some message handler..
        for this example i will just print message to console
        """
        self.write_message("Did you just said " + message)
        #print "Client %s received a message : %s" % (self.id, message)
        
    def on_close(self):
        pass

class RealtimeSimulationHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Realtime Simulation", ContentName="This is a demo of conversation between client and server")
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "realTimeSimulation.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)