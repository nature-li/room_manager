import time
import base64
from captcha.image import ImageCaptcha


image = ImageCaptcha(fonts=['/Users/liyanguo/cluster/centos/work/room_manager/src/static/fonts/DroidSansMono.ttf'])

data = image.generate('abde123')
print base64.b64encode(data.getvalue())
