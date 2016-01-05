import json

class SettingHelper:
    @staticmethod
    def getMaxBid():
        try:
            with open("static/setting/realtime.json", "r") as f:
                #print f.read()
                settingFile = json.load(f)
                return settingFile["maxBid"]
        except:
            print "error getting setting"
            return 20

    @staticmethod
    def setMaxBid(round):
        try:
            with open("static/setting/realtime.json", "r") as f:
                settingFile = json.load(f)
                settingFile["maxBid"] = round
            with open("static/setting/realtime.json", "w") as f:
                json.dump(settingFile, f)
                print "max bid setting changed"
        except:
            return

    @staticmethod
    def getMaxConnection():
        try:
            with open("static/setting/realtime.json", "r") as f:
                #print f.read()
                settingFile = json.load(f)
                return settingFile["maxConnection"]
        except:
            return 4

    @staticmethod
    def setMaxConnection(connection):
        try:
            with open("static/setting/realtime.json", "r+") as f:
                settingFile = json.load(f)
                settingFile["maxConnection"] = connection
            with open("static/setting/realtime.json", "w") as f:
                json.dump(settingFile, f)
                print "max connection setting changed"
        except Exception as ex:
            print ex
            return






