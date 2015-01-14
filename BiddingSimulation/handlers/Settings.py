import ujson

class SettingHelper:
    @staticmethod
    def getMaxBid():
        try:
            with open("static/setting/realtime.json", "r") as f:
                #print f.read()
                settingFile = ujson.loads(f.read())
                return settingFile["maxBid"]
        except:
            return 20

    @staticmethod
    def setMaxBid(round):
        try:
            with open("static/setting/realtime.json", "r") as f:
                settingFile = ujson.loads(f.read())
                settingFile["maxBid"] = round
                result = ujson.dumps(settingFile)
            with open("static/setting/realtime.json", "w") as f:
                f.write(result)
        except:
            return

    @staticmethod
    def getMaxConnection():
        try:
            with open("static/setting/realtime.json", "r") as f:
                #print f.read()
                settingFile = ujson.loads(f.read())
                return settingFile["maxConnection"]
        except:
            return 20

    @staticmethod
    def setMaxConnection(connection):
        try:
            with open("static/setting/realtime.json", "r") as f:
                settingFile = ujson.loads(f.read())
                settingFile["maxConnection"] = connection
                result = ujson.dumps(settingFile)
            with open("static/setting/realtime.json", "w") as f:
                f.write(result)
        except:
            return






