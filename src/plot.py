# -*- coding: utf-8 -*-

import sys
reload(sys)
sys.setdefaultencoding('utf-8')

import matplotlib.pyplot as plt
from sys import argv
from os import path
import json
from math import pi

PROJECT_PATH = argv[1]
NUM_SESSIONS = int(argv[2])
METHOD       = argv[3]

print(PROJECT_PATH, NUM_SESSIONS)

def fn(x):
    try : return float(x)
    except : return x

for i in range(0, NUM_SESSIONS):
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
    with open(path.join(PROJECT_PATH, 'results', METHOD, 'ses{}'.format(i + 1) ), 'rt') as file,\
         open(path.join(PROJECT_PATH, 'results', METHOD, 'photos_ses{}.json'.format(i + 1) ), 'rt') as filephotos:
        lines = map(lambda x : map(fn, x.split(',')) , file.readlines())
        photos = json.loads(''.join(filephotos.readlines()))
        #print photos
        photos_coord = map(lambda x : x['coordinates']['geo'][0:2], photos)
        photos_row = map(lambda x : [x['numRow'], 0], photos)
    for length, j in enumerate(lines):
        #print length, len(i)
        dateInertial, latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS, aN, aE, aD, aN_, aE_, aD_, roll, pitch, yaw = j
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

    fig, ax = plt.subplots()
    fig.suptitle('Sesión {}'.format(i + 1), fontsize = 15)
    ax.plot(iner_x, iner_y, label = "Recorrido Inercial")
    ax.plot(gnss_x, gnss_y, 'r', label = "Recorrido GNSS")
    ax.plot(*zip(*map(lambda x: map(lambda y : y*180/pi, x)[::-1], photos_coord)), marker='o', color='black', ls='', label = "Foto/Parada")
    ax.legend(loc='upper center', shadow=True)
    plt.show()
    ###########################
    fig, ax = plt.subplots()
    fig.suptitle('Sesión {}'.format(i + 1), fontsize = 15)
    ax.plot(aNa, label = "Aceleración Northing Inercial")
    ax.plot(aN_a, 'r', label = "Aceleración Northing GNSS")
    ax.plot(*zip(*photos_row), marker='o', color='black', ls='', label = "Foto/Parada")
    ax.legend(loc='upper center', shadow=True)
    plt.show()
    #########################
    fig, ax = plt.subplots()
    fig.suptitle('Sesión {}'.format(i + 1), fontsize = 15)
    ax.plot(aEa, label = "Aceleración Easting Inercial")
    ax.plot(aE_a, 'r', label = "Aceleración Northing GNSS")
    ax.plot(*zip(*photos_row), marker='o', color='black', ls='', label = "Foto/Parada")
    ax.legend(loc='upper center', shadow=True)
    plt.show()
    #####################
    fig, ax = plt.subplots()
    fig.suptitle('Sesión {}'.format(i + 1), fontsize = 15)
    ax.plot(aDa, label = "Aceleración Down Inercial")
    ax.plot(aD_a, 'r', label = "Aceleración Down GNSS")
    ax.plot(*zip(*photos_row), marker='o', color='black', ls='', label = "Foto/Parada")
    ax.legend(loc='upper center', shadow=True)
    plt.show()
