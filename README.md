# Introduction
***
The **main objetive** of this practice is to ```build useful``` packages and routines for the collected data coming from mobile platform equipped with a ``low-cost INS (Xsens-Mtx)`` along with a ``GNSS receiver``.
>The data is collected in parts, called **sessions**. For each session we will calculate
- ``The path the Platform followed`` (Using a free inertial solution and using a bounded solution)
- ``The coordinates of the camera everytime a photo was taken``. If no photos was taken for a session, ``the coordinates of platform everytime the platform stopped`` are calculated instead.

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
- ``A .html file per session`` (opened on finish) providing a Openlayers 4 map in which are represented the path of the platform (calculated with data from inertial system and the obtained with GNSS techniques) and the coordinates of the photos or stops, according to each session.
- ``A graph per session`` of the exactly the same data displayed on the .html file
- ``A graph per session`` of accelerations for each axis (``N,E,D`` in our case) which will plot the accelerations for obtained with the inertial system and the accelerations obtained with GNSS techniques combined with the position of the photos or stops in the graph.
- ``A file per session`` containing all the data merged with the calculations for every epoch of the insertial sensor.(Position obtained with GNSS data, position obtained with INS system, accelerations obtained with the GNSS data, accelerations calculated with the inertial data, velocities, euler angles, ...)
- ``A file per session`` containing the coordinates of the photos or stops, according to each session.

# Workflow
***

>I've done some modules in order to organize the programming workflow. These are the implemented modules and its use

- [``async``](https://github.com/joseahr/gnss-ins-data/tree/master/src/utils/async) Some helpers to read data asynchronously, but write JS as if it were synchronous, wrapping the stuff in [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).
- [``elipsoides``](https://github.com/joseahr/gnss-ins-data/tree/master/src/utils/elipsoides) Contain a helper class to obtain ellipsoide parameters. By the way, only the following ellipsoids are available in the file [elipsoides.json](https://github.com/joseahr/gnss-ins-data/blob/master/src/utils/elipsoides/elipsoides.json): GRS80 and WGS84.
- [``formulas``](https://github.com/joseahr/gnss-ins-data/tree/master/src/utils/formulas) Contain some functions which make numeric calculations with data needed for the practice.
- [``proyecciones``](https://github.com/joseahr/gnss-ins-data/tree/master/src/utils/proyecciones) By the way only contains [a function](https://github.com/joseahr/gnss-ins-data/blob/master/src/utils/proyecciones/geo-utm.ts) to convert geographic coordinates to UTM projected coordinates.
- [``parse-data``](https://github.com/joseahr/gnss-ins-data/tree/master/src/utils/parse-data) Contain the algorithms for parsing, merge and do the calculations for a single session.
- [``project``](https://github.com/joseahr/gnss-ins-data/tree/master/src/utils/project) Contain a helper class for the project. This class receives the path of the project data and take the necessary information from the parse-data functions to build the results for all sessions.
- [``radios-curvatura``](https://github.com/joseahr/gnss-ins-data/tree/master/src/utils/radios-curvatura) Contain a helper class for getting the ro and nhu values given a latitude and an ellipsoid.
- [``somigliana.ts``](https://github.com/joseahr/gnss-ins-data/tree/master/src/utils/somigliana) Implementation of the somigliana formula.

Some other important files are:
- [``plot.py``](https://github.com/joseahr/gnss-ins-data/blob/master/src/plot.py) Which do all the stuff of plot the graphs.
- [``index.html``](https://github.com/joseahr/gnss-ins-data/blob/master/src/index.html) Is used as a template to build the openlayers map for each session.

The starting point of the application is the [index.js](https://github.com/joseahr/gnss-ins-data/blob/master/src/index.ts) file from ``dist`` (That is created once the ``.ts`` files are compiled to ``.js`` files)

To install and use the tool you need both ``NodeJS 6.x`` and ``python 2.7`` installed.

Clone or download the project.
```
git clone https://github.com/joseahr/gnss-ins-data.git
```
Go to the project directory and type the following:
```
npm install
```
Now you can use the cli-tool wherever you want.

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
