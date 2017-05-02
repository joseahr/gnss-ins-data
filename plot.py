with open('result', 'rt') as file:
    lines = map(lambda x : map(float, x.split(',')) , file.readlines())
import matplotlib.pyplot as plt

iner_x = []
iner_y = []

gnss_x = []
gnss_y = []

for i in lines :
    latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS = i
    #print latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS
    iner_x.append(lonIner)
    iner_y.append(latIner)
    gnss_x.append(lonGNSS)
    gnss_y.append(latGNSS)

plt.plot(iner_x, iner_y)
plt.plot(gnss_x, gnss_y, 'r')
plt.show()
