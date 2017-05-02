with open('result', 'rt') as file:
    lines = map(lambda x : map(float, x.split(',')) , file.readlines())
import matplotlib.pyplot as plt

iner_x = []
iner_y = []

gnss_x = []
gnss_y = []

aNa = []
aEa = []
aDa = []

aN_a = []
aE_a = []
aD_a = []

for i in lines :
    dateInertial, latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS, aN, aE, aD, aN_, aE_, aD_ = i
    #print latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS
    iner_x.append(lonIner)
    iner_y.append(latIner)
    gnss_x.append(lonGNSS)
    gnss_y.append(latGNSS)

    aNa.append(aN)
    aEa.append(aE)
    aDa.append(aD)

    aN_a.append(aN_)
    aE_a.append(aE_)
    aD_a.append(aD_)

plt.plot(iner_x, iner_y)
plt.plot(gnss_x, gnss_y, 'r')
plt.show()

plt.plot(aNa)
plt.plot(aN_a, 'r')
plt.show()

plt.plot(aEa)
plt.plot(aE_a, 'r')
plt.show()

plt.plot(aDa)
plt.plot(aD_a, 'r')
plt.show()

