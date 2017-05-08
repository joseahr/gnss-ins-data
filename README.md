# Introduction
***
The **main objetive** of this practice is to ```build useful``` packages and routines for the collected data coming from mobile platform equipped with a ``low-cost INS (Xsens-Mtx)`` along with a ``GNSS receiver``.
>The data is collected in parts, called **sessions**. For each session we will calculate
- ``The path the Platform followed`` (Using a free inertial solution and using a bounded solution)
- ``The coordinates of the camera eveytime a photo was taken``. If no photos was taken for a session, ``the coordinates of every stop of the platform`` are calculated instead.

> The selected **programming languages** are
- ``TypeScript`` (For building a ``NodeJS project`` which will do all the stuff of calculations)
- ``Python`` (For building the result graphs from the results)

>The final tool is a ``command line interface tool`` which accept the following parameters
```p
	Usage
	  $ gnss-ins-calc <path/to/project/data> [-- <session-delays> [args]] [-- <photo-delays> [args]] [-- <method> [free|bound]]
	Options
	  --session-delays  A list of delays for each session (Used to match the GNSS and INS data together)
	  --photo-delays   A list of delays for each session (Used to match the pictures with the merged data (GNSS + INS))
	  --method The method for calculating the platform position  [free|bound] default : bound
	Example
	  $ gnss-ins-calc . --session-delays 10,20,30,40 --photo-delays 10,20,30,40
```

>The app will output the following results
- ``A .html file`` (opened on finish) providing a Openlayers 4 map in which are represented the path of the platform (calculated with data from inertial system and the obtained with GNSS techniques) and the coordinates of the photos or stops, according with each session.
- ``A graph`` of the exactly the same data displayed on the .html file
- ``A graph`` of accelerations for each axis (N,E,D in our case) which will plot the accelerations for obtained with the inertial system and the accelerations obtained with GNSS techniques combined with the position of the photos or stops in the graph.

# Workflow
***


# Results
***
#### Free inertial solution
Here are shown the results for the free inertial solution.
>Session I (Path)

![>Session I (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses1_rec.jpg) 

>Session II (Path)

![>Session II (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses2_rec.jpg) 

>Session III (Path)

![>Session III (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses3_rec.jpg) 

>Session IIII (Path)

![>Session IIII (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses4_rec.jpg) 


#### Bounded solution
Here are shown the results for the bounded solution.
>Session I (Path)

![>Session I (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/ligado/graficas/ses1_rec.jpg) 

>Session II (Path)

![>Session II (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/ligado/graficas/ses2_rec.jpg) 


>Session III (Path)

![>Session III (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/ligado/graficas/ses3_rec.jpg) 

>Session IIII (Path)

![>Session IIII (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/ligado/graficas/ses4_rec.jpg) 

#### Accelerations

>Session I (Acceleration Northing Axis)

![Session I (Acceleration Northing Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses1_acc_n.jpg) 

>Session I (Acceleration Easting Axis)

![Session I (Acceleration Easting Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses1_acc_e.jpg) 

>Session I (Acceleration Down Axis)

![Session I (Acceleration Down Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses1_acc_d.jpg) 

>Session II (Acceleration Northing Axis)

![Session II (Acceleration Northing Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses2_acc_n.jpg) 

>Session II (Acceleration Easting Axis)

![Session II (Acceleration Easting Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses2_acc_e.jpg) 

>Session II (Acceleration Down Axis)

![Session II (Acceleration Down Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses2_acc_d.jpg) 

>Session III (Acceleration Northing Axis)

![Session III (Acceleration Northing Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses3_acc_n.jpg) 

>Session III (Acceleration Easting Axis)

![Session III (Acceleration Easting Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses3_acc_e.jpg) 

>Session III (Acceleration Down Axis)

![Session III (Acceleration Down Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses3_acc_d.jpg) 

>Session IIII (Acceleration Northing Axis)

![Session IIII (Acceleration Northing Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses4_acc_n.jpg) 

>Session IIII (Acceleration Easting Axis)

![Session IIII (Acceleration Easting Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses4_acc_e.jpg) 

>Session IIII (Acceleration Down Axis)

![Session IIII (Acceleration Down Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses4_acc_d.jpg) 
