# Content
---
- [Introduction](#introduction)
- [Workflow](#workflow)
	- [Software Implemented](#software-implemented)
	- [How it works?](#how-it-works)
		- [Calculating the coordinates of the pictures](#calculating-the-coordinates-of-the-pictures)
		- [Calculating the coordinates of the stops](#calculating-the-coordinates-of-the-stops)
- [Results](#results)
- [Conclusions](#conclusions)

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

```xterm
	Usage
	  $ gnss-ins-calc <path/to/project/data> [-- <session-delays> [args]] [-- <photo-delays> [args]] [-- <method> [free|bound]]
	Options
	  --session-delays  A list of delays for each session (Used to match the GNSS and INS data together)
	  --photo-delays   A list of delays for each session (Used to match the pictures with the merged data (GNSS + INS))
	  --method The method for calculating the platform position  [free|bound] default : bound
	Example
	  $ gnss-ins-calc . --session-delays 10,20,30,40 --photo-delays 10,20,30,40
```

Examples:

![Terminal](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/terminal.png) 


>The app will output the following results

- ``A .html file per session`` (opened on finish) providing an Openlayers 4 map in which are represented the path of the platform (calculated with data from inertial system and the obtained with GNSS techniques) and the coordinates of the photos or stops, according to each session.
- ``A graph per session`` of the exactly the same data displayed on the .html file
- ``A graph per session`` of accelerations for each axis (``N,E,D`` in our case) which will plot the accelerations for obtained with the inertial system and the accelerations obtained with GNSS techniques combined with the position of the photos or stops in the graph.
- ``A file per session`` containing all the data merged with the calculations for every epoch of the insertial sensor.(Position obtained with GNSS data, position obtained with INS system, accelerations obtained with the GNSS data, accelerations calculated with the inertial data, velocities, euler angles, ...)
- ``A file per session`` containing the coordinates of the photos or stops, according to each session.

# Workflow
***

### Software implemented

>I've done some modules in order to organize the programming workflow. These are the implemented modules and its use

- [``async``](https://github.com/joseahr/gnss-ins-data/tree/master/src/utils/async) Some helpers to read data asynchronously, but write JS code in a synchronous manner, wrapping the stuff in [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).
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

### How it works?

#### Calculating position and accelerations

First of all, GNSS data is readed and parsed, so that we get an array like this:

``[[date, lat, lon, h, vN, vE, vD, aN, aE, aD], ...]``

where ``vN, vE, vD`` are the velocities in each axis and ``aN, aE, aD`` are the accelerations in each axis.

The velocities and accelerations are calculated using the next and the previous data for each epoch.

INS data (angles and accelerations) are readed and parsed, so that we get an arraylike this:

``[[date, roll, pitch, yaw, ax, ay, az], ...]``

date is still the relative date obtained from the INS by the way, but we will calculate it later when both data are merged.
roll, pitch and yaw are the euler angles and [ax, ay, az] are the accelerations for (N, E, D) axis in the navigation frame.

Data gaps are solved in this process.

The accelerations are translated from the inertial frame to the navigation frame using the following rotation matrix:

```typescript
export function getRotationMatrix(roll : number, pitch : number, yaw : number){
    let   c11 = Math.cos(pitch)*Math.cos(yaw)
        , c12 = Math.sin(roll)*Math.sin(pitch)*Math.cos(yaw)-Math.cos(roll)*Math.sin(yaw)
        , c13 = Math.cos(roll)*Math.sin(pitch)*Math.cos(yaw)+Math.sin(roll)*Math.sin(yaw)
        
        , c21 = Math.cos(pitch)*Math.sin(yaw)
        , c22 = Math.sin(roll)*Math.sin(pitch)*Math.sin(yaw)+Math.cos(roll)*Math.cos(yaw)
        , c23 = Math.cos(roll)*Math.sin(pitch)*Math.sin(yaw)-Math.sin(roll)*Math.cos(yaw)

        , c31 = -(Math.sin(pitch))
        , c32 = Math.sin(roll)*Math.cos(pitch)
        , c33 = Math.cos(roll)*Math.cos(pitch);
        
    return nj.array([[c11, c12, c13], [c21, c22, c23], [c31, c32, c33]]);
}
```

And the vector provided in the manual of the ``low-cost INS (Xsens-Mtx)``:

```typescript
let matrix = nj.array([ [1, 0, 0], [0, -1, 0], [0, 0, -1] ]);
```

When both data are parsed, a process that aims to merge the data is executed.
A delay is introduced for each session in order to match the accelerations from the GNSS and the INS.

The first we check in the main loop for each epoch of the GNSS data is update the position and velocities of the inertial data with the position and velocities for the GNSS data if the method is bounded solution: 

```typescript
if(metodo == MetodoAjusteISNGNSS.Ligado || i == 0){
	[latIner, lonIner, hIner] = [latGNSS, lonGNSS, hGNSS];
	[vN, vE, vD] = [vN_, vE_, vD_];
}
```

This equation is calculated with the average of 200 (1 second)observations backwards and 200 observations forwards. Finally we obtain the position with the followinf formulas:

![Ecuación](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/equation.png) 

#### Calculating the coordinates of the pictures

First the data from sessions.txt is parsed and stored with the following structure:

```json
[
	{
		"photoID": "photo 01",
		"date": "2017-3-2 10:19:20",
		"imgName": "IMG_1388",
		"updated": false
	},
	...
]
```

For calculating the coordinates of the pictures the merged data is received as an input. We loop throught the merged data and look for the date match between a picture and the actul epoch. A delay is introduced in order to match the difference of time between the picture (measured with the watch) and the data that is calculated with the time of the GNSS receiver.

Once the correct index of the photo is found, an averge of 200 observations backwards and 200 observations forwards is made for thee variables (longitude, latitude and helip) and (roll, pitch and yaw).

A rotation matrix is get from the roll, pitch and yaw (averaged)

```typescript
let rotationMtx = getRotationMatrix(roll, pitch, yaw);
```

Calculate the UTM coordinates in order to have the coordinates in meters and apply the vectors to transform the coordinates of the picture from the navigation frame to the body frame.

```typescript
let [X, Y, h, ..._] : any[] = GeoToUTM([latitude*Math.PI/180, longitude*Math.PI/180, helip], 'GRS80');
```

The vectors to transform the coordinates are the following:

```typescript
const GPSVector = [0, 0, 0.2]; // En el iframe
const CamVector = [0.1940, 0.2540, 0.035]; // En el iframe
```

Finally we apply the vectors to transform the coordinates and update the properties of the photo such as date, coordinates (geo and UTM) and attitude.

```typescript
let [ GPSVecx, GPSVecy, GPSVecz ] = rotationMtx.dot(nj.array(GPSVector)).tolist();
let [ CamVecx, CamVecy, CamVecz ] = rotationMtx.dot(nj.array(CamVector)).tolist();
let [ XINS, YINS, hINS ] = [ X - GPSVecx, Y - GPSVecy, h - GPSVecz ];
let [ XCam, YCam, hCam ] = [ XINS + CamVecx, YINS + CamVecy, hINS + CamVecz ];

photo.date = new Date(mergedData[index + photoDelay][0]);
photo.coordinates = {
	  utm : [XCam, YCam, hCam].map( (num : number) => num.toFixed(3) )
	, geo : [latitude*Math.PI/180, longitude*Math.PI/180, helip]
};
photo.numRow  = index + photoDelay;
photo.attitude = [roll, pitch, yaw].map( (num : number) => num.toFixed(7) );
```

Finally the data we will look like this:
```json
[
	{
		"photoID": "photo 01",
		"date": "2017-3-2 10:19:20",
		"imgName": "IMG_1388",
		"updated": true,
		"coordinates": {
			"utm": [
				"728939.565",
				"4373364.983",
				"55.607"
			],
			"geo": [
				0.6890461402322617,
				-0.005903300052206686,
				55.76932904284051
			]
		},
		"numRow": 15200,
		"attitude": [
			"0.0117388",
			"0.0000000",
			"0.0000000"
		]
	},
	...
]
```

#### Calculating the coordinates of the stops

For the session III with didn't take any photo. For this session we will calculate the coordinates of the stops as accurate as possible.

For doing this stuff we will loop throught the merged data  and take 200 observations backwards and 200 observations forwards.

We will take the absolute value of the observations.

We will calculate the line that best fit the points of the data backwards, and the mean for the data forwards.

```typescript
mergedData.forEach( (el, index, array)=>{
	if(index < halfRange) return;
	if(mergedData.length - index < halfRange) return;

	let y = mergedData
		.slice(index - halfRange, index)
		.map( e => Math.abs(e[7]) )
		//.filter( e => e >= 0 );
	let ymean = mathjs.mean(
		mergedData
		.slice(index, index + halfRange)
		.map( e => Math.abs(e[7]) )
	);

	if(ymean > 0.1) return;

	let Y = nj.array(y);

	let a = mergedData
		.slice(index - halfRange, index)
		.map( (e, i) => [ 1, index - halfRange + i, e ] )
		//.filter( e => e[2] >= 0 )
		.map( e => e.slice(0, 2) );
	let A = nj.array(a);

	try {
		var U = nj.array(mathjs.inv( A.T.dot(A).tolist() )).dot( A.T.dot(Y) ).tolist()
	} catch(e){
		return;
	}

	...
```

If the intersection of the calculated line with the X axis is near the actual point and the average of the accelerations forwards is not greather than 0.1 we consider a stop is done.

```typescript	
	...

        let pendiente = U[1];
        let ordenadaAbs = U[0];
        let xcorte0 = ordenadaAbs/(-pendiente);

        //console.log(index, U[0]/(-U[1]));
        if(
            xcorte0 < index - (halfRange/4) || xcorte0 > index + (halfRange/4)
        ) return;
        //console.log('Parada : ' + index);
        let [latitude, longitude, helip] = el.slice(1, 4);
        dataStops.push({ numRow : Math.floor(xcorte0), coordinates : { geo : [latitude*Math.PI/180, longitude*Math.PI/180, helip] } })
    });
    return dataStops;
}
```

The data obtained for the stops is another json with the coordinates:

```json
[
	{
		"numRow": 2980,
		"coordinates": {
			"geo": [
				0.6890494886631449,
				-0.005901773640853095,
				55.50585634786639
			]
		}
	}, 
	...
]
```

And we can see the points in the graph:

![Example Stops](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/example-stop.png)

# Results
***

[You can also check for text file results](https://github.com/joseahr/gnss-ins-data/tree/master/example/Data/results)

![Example Map](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/example-map.PNG)


![Example Map 2](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/example-map2.PNG)


#### Free inertial solution

Here are shown the results for the free inertial solution.

>Session I (Path)
>Points are pictures

![>Session I (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses1_rec.jpg) 

>Session II (Path)
>Points are pictures

![>Session II (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses2_rec.jpg) 

>Session III (Path)
>Points are sops

![>Session III (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses3_rec.jpg) 

>Session IIII (Path)
>Points are pictures

![>Session IIII (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses4_rec.jpg) 


#### Bounded solution
Here are shown the results for the bounded solution.
>Session I (Path)
>Points are pictures

![>Session I (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/ligado/graficas/ses1_rec.jpg) 

>Session II (Path)
> Points are pictures

![>Session II (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/ligado/graficas/ses2_rec.jpg) 


>Session III (Path)
>Points are stops

![>Session III (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/ligado/graficas/ses3_rec.jpg) 

>Session IIII (Path)
>Points are pictures

![>Session IIII (Path)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/ligado/graficas/ses4_rec.jpg) 

#### Accelerations

>Session I (Acceleration Northing Axis)
>Points are pictures

![Session I (Acceleration Northing Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses1_acc_n.jpg) 

>Session I (Acceleration Easting Axis)

![Session I (Acceleration Easting Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses1_acc_e.jpg) 

>Session I (Acceleration Down Axis)

![Session I (Acceleration Down Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses1_acc_d.jpg) 

>Session II (Acceleration Northing Axis)
>Points are pictures

![Session II (Acceleration Northing Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses2_acc_n.jpg) 

>Session II (Acceleration Easting Axis)

![Session II (Acceleration Easting Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses2_acc_e.jpg) 

>Session II (Acceleration Down Axis)

![Session II (Acceleration Down Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses2_acc_d.jpg) 

> Session III (Acceleration Northing Axis)
> Points are stops

![Session III (Acceleration Northing Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses3_acc_n.jpg)

>Session III (Acceleration Easting Axis)

![Session III (Acceleration Easting Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses3_acc_e.jpg) 

>Session III (Acceleration Down Axis)

![Session III (Acceleration Down Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses3_acc_d.jpg) 

>Session IIII (Acceleration Northing Axis)
>Points are pictures

![Session IIII (Acceleration Northing Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses4_acc_n.jpg) 

>Session IIII (Acceleration Easting Axis)

![Session IIII (Acceleration Easting Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses4_acc_e.jpg) 

>Session IIII (Acceleration Down Axis)

![Session IIII (Acceleration Down Axis)](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/libre/graficas/ses4_acc_d.jpg) 


# Conclusions
***

We can say that the INS data could be useful in case of signal loss. Algorith such as Kalman filter could be used in that case in order to predict the positions.

We could also use a RAMSAC algorith to try to automaticly correlate the accelerations instead of manually insert a time delay.

We can see here a more detailed representation of the bound solution:

![Bound Solution Detail](https://raw.githubusercontent.com/joseahr/gnss-ins-data/master/images/example-bound-solution-detail.PNG) 