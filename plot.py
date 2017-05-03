def fn(x):
    try :
        return float(x)
    except : 
        return x

with open('ses1', 'rt') as file1, open('ses2', 'rt') as file2, open('ses3', 'rt') as file3, open('ses4', 'rt') as file4:
    lines1 = map(lambda x : map(fn, x.split(',')) , file1.readlines())
    lines2 = map(lambda x : map(fn, x.split(',')) , file2.readlines())
    lines3 = map(lambda x : map(fn, x.split(',')) , file3.readlines())
    lines4 = map(lambda x : map(fn, x.split(',')) , file4.readlines())

import matplotlib.pyplot as plt

iner_x1 = []
iner_x2 = []
iner_x3 = []
iner_x4 = []

iner_y1 = []
iner_y2 = []
iner_y3 = []
iner_y4 = []

gnss_x1 = []
gnss_x2 = []
gnss_x3 = []
gnss_x4 = []

gnss_y1 = []
gnss_y2 = []
gnss_y3 = []
gnss_y4 = []

aNa1 = []
aNa2 = []
aNa3 = []
aNa4 = []

aEa1 = []
aEa2 = []
aEa3 = []
aEa4 = []

aDa1 = []
aDa2 = []
aDa3 = []
aDa4 = []

aN_a1 = []
aN_a2 = []
aN_a3 = []
aN_a4 = []

aE_a1 = []
aE_a2 = []
aE_a3 = []
aE_a4 = []

aD_a1 = []
aD_a2 = []
aD_a3 = []
aD_a4 = []

for length, i in enumerate(lines1) :
    #print length, len(i)
    dateInertial, latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS, aN, aE, aD, aN_, aE_, aD_ = i
    #print latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS
    iner_x1.append(lonIner)
    iner_y1.append(latIner)
    gnss_x1.append(lonGNSS)
    gnss_y1.append(latGNSS)

    aNa1.append(aN)
    aEa1.append(aE)
    aDa1.append(aD)

    aN_a1.append(aN_)
    aE_a1.append(aE_)
    aD_a1.append(aD_)

for length, i in enumerate(lines2) :
    #print length, len(i)
    dateInertial, latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS, aN, aE, aD, aN_, aE_, aD_ = i
    #print latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS
    iner_x2.append(lonIner)
    iner_y2.append(latIner)
    gnss_x2.append(lonGNSS)
    gnss_y2.append(latGNSS)

    aNa2.append(aN)
    aEa2.append(aE)
    aDa2.append(aD)

    aN_a2.append(aN_)
    aE_a2.append(aE_)
    aD_a2.append(aD_)

for length, i in enumerate(lines3) :
    #print length, len(i)
    dateInertial, latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS, aN, aE, aD, aN_, aE_, aD_ = i
    #print latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS
    iner_x3.append(lonIner)
    iner_y3.append(latIner)
    gnss_x3.append(lonGNSS)
    gnss_y3.append(latGNSS)

    aNa3.append(aN)
    aEa3.append(aE)
    aDa3.append(aD)

    aN_a3.append(aN_)
    aE_a3.append(aE_)
    aD_a3.append(aD_)

for length, i in enumerate(lines4) :
    #print length, len(i)
    dateInertial, latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS, aN, aE, aD, aN_, aE_, aD_ = i
    #print latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS
    iner_x4.append(lonIner)
    iner_y4.append(latIner)
    gnss_x4.append(lonGNSS)
    gnss_y4.append(latGNSS)

    aNa4.append(aN)
    aEa4.append(aE)
    aDa4.append(aD)

    aN_a4.append(aN_)
    aE_a4.append(aE_)
    aD_a4.append(aD_)

plt.plot(iner_x1, iner_y1)
plt.plot(gnss_x1, gnss_y1, 'r')
plt.show()

plt.plot(iner_x2, iner_y2)
plt.plot(gnss_x2, gnss_y2, 'r')
plt.show()

plt.plot(iner_x3, iner_y3)
plt.plot(gnss_x3, gnss_y3, 'r')
plt.show()

plt.plot(iner_x4, iner_y4)
plt.plot(gnss_x4, gnss_y4, 'r')
plt.show()

###########################

plt.plot(aNa1)
plt.plot(aN_a1, 'r')
plt.show()

plt.plot(aNa2)
plt.plot(aN_a2, 'r')
plt.show()

plt.plot(aNa3)
plt.plot(aN_a3, 'r')
plt.show()

plt.plot(aNa4)
plt.plot(aN_a4, 'r')
plt.show()

#########################3

plt.plot(aEa1)
plt.plot(aE_a1, 'r')
plt.show()

plt.plot(aEa2)
plt.plot(aE_a2, 'r')
plt.show()

plt.plot(aEa3)
plt.plot(aE_a3, 'r')
plt.show()

plt.plot(aEa4)
plt.plot(aE_a4, 'r')
plt.show()

#####################

plt.plot(aDa1)
plt.plot(aD_a1, 'r')
plt.show()

plt.plot(aDa2)
plt.plot(aD_a2, 'r')
plt.show()

plt.plot(aDa3)
plt.plot(aD_a3, 'r')
plt.show()

plt.plot(aDa4)
plt.plot(aD_a4, 'r')
plt.show()

