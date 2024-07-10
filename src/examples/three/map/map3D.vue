<template>
	<div>
		<div id="container"></div>
	</div>
</template>
<script>
import * as THREE from 'three';
// 导入控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// 引入房间环境，创建一个室内环境
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
// 导入性能监视器
import Stats from 'three/examples/jsm/libs/stats.module.js';
// 导入gltf载入库、模型加载器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// 引入模型解压器
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
//GUI界面
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import gsap from 'gsap';

import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

import {
	CSS2DRenderer,
	CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import beijing from './json/beijing.json'
import beijingout from './json/beijingout.json'
import * as d3 from 'd3';//引入d3

let renderer, scene, camera, controls, labelRenderer, stars;
let particleArr = [];
let textureLoader = new THREE.TextureLoader(); //纹理贴图加载器
let map = new THREE.Group();
let centerPos = [116.41, 40.25];
let WaveMeshArr = []; //所有波动光圈集合
let uniforms2 = {
	u_time: { value: 0.0 },
};
let rotatingApertureMesh, rotatingPointMesh;
export default {
	data() {
		return {
			container: null, //界面需要渲染的容器
			scene: null,	// 场景对象
			camera: null, //相机对象
			renderer: null, //渲染器对象
			controller: null,	// 相机控件对象
			stats: null,// 性能监听器
			mixer: null,//动画混合器
			model: null,//导入的模型
			clock: new THREE.Clock()// 创建一个clock对象，用于跟踪时间
		};
	},
	mounted() {
		this.init()
		this.animate()  //如果引入了模型并存在动画，可在模型引入成功后加载动画
		window.addEventListener("resize", this.onWindowSize)
	},
	beforeUnmount() {
		console.log('beforeUnmount===============');
		// 组件销毁时置空
		this.container = null
		this.scene = null
		this.camera = null
		this.renderer = null
		this.controller = null
		this.stats = null
		this.mixer = null
		this.model = null//导入的模型
	},
	methods: {
		/**
		* @description 初始化
		 */
		init() {
			this.container = document.getElementById('container')
			this.setScene()
			this.setCamera()
			this.setRenderer()
			this.setController()
			this.addHelper()
			this.setLight()
			this.addStatus()
			this.initGeoJson()
			this.initParticle()
			this.initPoints()
			this.initFloor()
		},
		/**
		 * @description 创建场景
		 */
		setScene() {
			// 创建场景对象Scene
			this.scene = new THREE.Scene()
			// 设置场景背景
			// this.scene.background = new THREE.Color(0xbfe3dd);
		},
		/**
		 * @description 创建相机
		*/
		setCamera() {
			// 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
			this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000)
			// 设置相机位置
			this.camera.position.set(80, 80, 80)
			// 设置摄像头宽高比例
			this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
			// 设置摄像头投影矩阵
			this.camera.updateProjectionMatrix();
			// 设置相机视线方向
			this.camera.lookAt(new THREE.Vector3(0, 0, 0))// 0, 0, 0 this.scene.position
			// 将相机加入场景
			this.scene.add(this.camera)
		},
		/**
		 * @description 创建渲染器
		 */
		setRenderer() {
			// 初始化渲染器
			this.renderer = new THREE.WebGLRenderer({
				antialias: true,// 设置抗锯齿
				alpha: false,
				logarithmicDepthBuffer: true,  // 是否使用对数深度缓存
			})
			// 设置渲染器宽高
			this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
			// 设置渲染器的像素比
			this.renderer.setPixelRatio(window.devicePixelRatio);
			// 是否需要对对象排序
			// this.renderer.sortObjects = false;
			// 将渲染器添加到页面
			this.container.appendChild(this.renderer.domElement);
			labelRenderer = new CSS2DRenderer();
			labelRenderer.setSize(
				this.container.clientWidth,
				this.container.clientHeight
			);
			labelRenderer.domElement.style.position = "absolute";
			labelRenderer.domElement.style.top = "0px";
			labelRenderer.domElement.style.pointerEvents = "none";
			container.appendChild(labelRenderer.domElement);
		},
		/**
		 * @description 添加创建控制器
		 */
		setController() {
			this.controller = new OrbitControls(this.camera, this.renderer.domElement);
			// 控制缩放范围
			// this.controller.minDistance = 1;
			// this.controller.maxDistance = 5;
			//是否开启右键拖拽
			// this.controller.enablePan = false;
			// 阻尼（惯性）
			this.controller.enableDamping = true; //启用阻尼（惯性）
			this.controller.dampingFactor = 0.04; //阻尼惯性有多大
			// this.controller.autoRotate = true; //自动围绕目标旋转
			// this.controller.minAzimuthAngle = -Math.PI / 3; //能够水平旋转的角度下限。如果设置，其有效值范围为[-2 * Math.PI，2 * Math.PI]，且旋转角度的上限和下限差值小于2 * Math.PI。默认值为无穷大。
			// this.controller.maxAzimuthAngle = Math.PI / 3;//水平旋转的角度上限,其有效值范围为[-2 * Math.PI，2 * Math.PI],默认值为无穷大
			// this.controller.minPolarAngle = 1; //能够垂直旋转的角度的下限，范围是0到Math.PI，其默认值为0。
			// this.controller.maxPolarAngle = Math.PI - 0.1; //能够垂直旋转的角度的上限，范围是0到Math.PI，其默认值为Math.PI。
			// 修改相机的lookAt是不会影响THREE.OrbitControls的target的
			// 由于设置了控制器，因此只能改变控制器的target以改变相机的lookAt方向
			this.controller.target.set(0, 0.5, 0); //控制器的焦点
		},
		/**
		* @description 添加创建模型
		*/
		initGeoJson() {
			this.initMap(beijingout)
			this.initMapLine(beijing)
		},

		initMap(beijingOutJson) {
			let textureMap = textureLoader.load(require("./mapimg/gz-map.jpeg"));
			let texturefxMap = textureLoader.load(
				require("./mapimg/gz-map-fx.jpeg")
			);
			textureMap.wrapS = THREE.RepeatWrapping; //纹理水平方向的平铺方式
			textureMap.wrapT = THREE.RepeatWrapping; //纹理垂直方向的平铺方式
			textureMap.flipY = texturefxMap.flipY = false;// 如果设置为true，纹理在上传到GPU的时候会进行纵向的翻转。默认值为true。
			textureMap.rotation = texturefxMap.rotation = THREE.MathUtils.degToRad(45);//rotation纹理将围绕中心点旋转多少度
			const scale = 0.01;
			textureMap.repeat.set(scale, scale);//repeat决定纹理在表面的重复次数
			texturefxMap.repeat.set(scale, scale);
			textureMap.offset.set(0.5, 0.5);//offset贴图单次重复中的起始偏移量
			texturefxMap.offset.set(0.5, 0.5);
			// MeshPhongMaterial(一种用于具有镜面高光的光泽表面的材质)
			const material = new THREE.MeshPhongMaterial({
				map: textureMap,//颜色贴图
				normalMap: texturefxMap,//用于创建法线贴图的纹理
				// normalScale: new THREE.Vector2(12.2, 2.2),//法线贴图对材质的影响程度
				color: "#7bc6c2",
				combine: THREE.MultiplyOperation,//如何将表面颜色的结果与环境贴图
				transparent: true,
				opacity: 1,
			});
			// MeshLambertMaterial(一种非光泽表面的材质，没有镜面高光)
			const material1 = new THREE.MeshLambertMaterial({
				color: 0x123024,
				transparent: true,
				opacity: 0.9,
			});
			// d3-geo墨卡托坐标转化
			const projection = d3
				.geoMercator()//地图投影方式(用于绘制球形墨卡托投影)
				.center(centerPos)//地图中心点经纬度坐标
				.scale(2500) //缩放
				.translate([0, 0]);//移动地图位置
			console.log('beijingOutJson.features :>> ', beijingOutJson.features);
			// 遍历省份构建模型
			beijingOutJson.features.forEach((elem) => {
				// 新建一个省份容器：用来存放省份对应的模型和轮廓线
				const meshArrs = new THREE.Object3D();
				const coordinates = elem.geometry.coordinates;//坐标合集
				const properties = elem.properties;
				coordinates.forEach((multiPolygon) => {
					multiPolygon.forEach((polygon) => {
						//Shape使用路径以及可选的孔洞来定义一个二维形状平面
						// 创建一条空路径，.currentPoint将被设置为原点。
						const shape = new THREE.Shape();
						var v3ps = [];
						for (let i = 0; i < polygon.length; i++) {
							const [x, y] = projection(polygon[i]);
							if (i === 0) {
								shape.moveTo(x, -y);//将.currentPoint移动到x, y
							}
							shape.lineTo(x, -y);//在当前路径上，从.currentPoint连接一条直线到x,y
							v3ps.push(new THREE.Vector3(x, -y, 4.02));
						}
						const extrudeSettings = {
							depth: 2, //该属性指定图形可以拉伸多高，默认值是100
							bevelEnabled: false, //是否给这个形状加斜面，默认加斜面。
						};
						//拉升成地图(从一个形状路径中，挤压出一个BufferGeometry)
						// ExtrudeGeometry --- 当使用这个几何体创建Mesh的时候，如果你希望分别对它的表面和它挤出的侧面使用单独的材质，你可以使用一个材质数组。 第一个材质将用于其表面；第二个材质则将用于其挤压出的侧面。
						const geometry = new THREE.ExtrudeGeometry(
							shape,
							extrudeSettings
						);
						const mesh = new THREE.Mesh(geometry, [
							material,//表面材质
							material1,//侧面材质
						]);
						mesh.rotateX(-Math.PI / 2);//x轴旋转
						mesh.position.set(0, 1.5, -3);//设置放置位置
						meshArrs.add(mesh);
						// 创建发光轮廓线，一个闭合的波状循环
						//CatmullRomCurve3 ---  从一系列的点创建一条平滑的三维样条曲线
						var curve = new THREE.CatmullRomCurve3(
							v3ps,//Vector3点数组
							true /*是否闭合*/
						);
						var flyLine = this.initFlyLine(
							curve,
							{
								speed: 0.4,
								color: new THREE.Color("#ffff00"),
								number: 3, //同时跑动的流光数量
								length: 0.2, //流光线条长度
								size: 4, //粗细
							},
							10000
						);
						flyLine.position.set(0, 0.1, -3);
						flyLine.scale.multiplyScalar(1.001);
						flyLine.rotateX(-Math.PI / 2);
						meshArrs.add(flyLine);
					});
				});
				map.add(meshArrs);
			});
			this.scene.add(map);
		},
		initLineMaterial(setting) {
			const number = setting
				? Number(setting.number) || 1.0
				: 1.0;
			const speed = setting ? Number(setting.speed) || 1.0 : 1.0;
			const length = setting
				? Number(setting.length) || 0.5
				: 0.5;
			const size = setting ? Number(setting.size) || 3.0 : 3.0;
			const color = setting
				? setting.color || new THREE.Vector3(0, 1, 1)
				: new THREE.Vector3(0, 1, 1);
			const singleUniforms = {
				u_time: uniforms2.u_time,
				number: { type: "f", value: number },
				speed: { type: "f", value: speed },
				length: { type: "f", value: length },
				size: { type: "f", value: size },
				color: { type: "v3", value: color },
			};
			const lineMaterial = new THREE.ShaderMaterial({
				uniforms: singleUniforms,
				vertexShader: `		varying vec2 vUv;
									  attribute float percent;
									  uniform float u_time;
									  uniform float number;
									  uniform float speed;
									  uniform float length;
									  varying float opacity;
									  uniform float size;
									  void main()
									  {
									      vUv = uv;
									      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
									      float l = clamp(1.0-length,0.0,1.0);
									      gl_PointSize = clamp(fract(percent*number + l - u_time*number*speed)-l ,0.0,1.) * size * (1./length);
									      opacity = gl_PointSize/size;
									      gl_Position = projectionMatrix * mvPosition;
									  }`,
				fragmentShader: `#ifdef GL_ES
									  precision mediump float;
									  #endif
									  varying float opacity;
									  uniform vec3 color;
									  void main(){
									      if(opacity <=0.2){
									          discard;
									      }
									      gl_FragColor = vec4(color,1.0);
									  }`,
				transparent: true,
				side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
			});
			return lineMaterial;
		},
		initFlyLine(curve, matSetting, pointsNumber) {
			var points = curve.getPoints(pointsNumber);
			var geometry = new THREE.BufferGeometry().setFromPoints(
				points
			);
			const length = points.length;
			var percents = new Float32Array(length);
			for (let i = 0; i < points.length; i += 1) {
				percents[i] = i / length;
			}
			geometry.setAttribute(
				"percent",
				new THREE.BufferAttribute(percents, 1)
			);
			const lineMaterial = this.initLineMaterial(matSetting);
			var flyLine = new THREE.Points(geometry, lineMaterial);
			return flyLine;
		},
		initMapLine(beijingJson) {
			var matLine = new LineMaterial({
				color: 0xffffff,
				linewidth: 0.0013,
				vertexColors: true,
				dashed: false,
				alphaToCoverage: true,
			});

			var matLine2 = new LineMaterial({
				color: "#01bdc2",
				linewidth: 0.0025,
				vertexColors: true,
				dashed: false,
				alphaToCoverage: true,
			});
			// d3-geo转化坐标
			const projection = d3
				.geoMercator()
				.center(centerPos)
				.scale(2500)
				.translate([0, 0]);
			// 遍历省份构建模型
			beijingJson.features.forEach((elem) => {
				const province = new THREE.Object3D();
				const coordinates = elem.geometry.coordinates;
				const properties = elem.properties;
				//这里创建光柱
				this.initLightPoint(properties, projection);
				coordinates.forEach((multiPolygon) => {
					multiPolygon.forEach((polygon) => {
						const positions = [];
						var colors = [];
						const color = new THREE.Color();
						var linGeometry = new LineGeometry();
						for (let i = 0; i < polygon.length; i += 1) {
							const [x, y] = projection(polygon[i]);
							positions.push(x, -y, 4.01);
							color.setHSL(1, 1, 1);
							colors.push(color.r, color.g, color.b);
						}
						//Line2
						linGeometry.setPositions(positions);
						linGeometry.setColors(colors);
						const line = new Line2(linGeometry, matLine);
						const line2 = new Line2(linGeometry, matLine2);
						line.computeLineDistances();
						line.rotateX(-Math.PI / 2);
						line2.rotateX(-Math.PI / 2);
						line.position.set(0, 0.1, -3);
						line2.position.set(0, -3.5, -3);
						line2.computeLineDistances();
						line.scale.set(1, 1, 1);
						province.add(line);
						province.add(line2);
					});
				});
				map.add(province);
			});
			this.scene.add(map);
		},

		initLightPoint(properties, projection) {
			// 创建光柱
			let heightScaleFactor = 8 + this.random(1, 5) / 5;
			let lightCenter = properties.centroid || properties.center;
			let areaName = properties.name;
			// let lightCenter = properties.centroid;
			// projection用来把经纬度转换成坐标
			const [x, y] = projection(lightCenter);
			let light = this.createLightPillar(x, y, heightScaleFactor);
			light.position.z -= 3;
			// light.position.y = 13.31;
			map.add(light);

			//这里创建坐标
			this.createTextPoint(x, y, areaName);
		},
		createTextPoint(x, z, areaName) {
			let tag = document.createElement("div");
			tag.innerHTML = name;
			// tag.className = className
			tag.style.color = "#fff";
			tag.style.pointerEvents = "none";
			// tag.style.visibility = 'hidden'
			tag.style.position = "absolute";
			let label = new CSS2DObject(tag);
			label.element.innerHTML = areaName;
			label.element.style.visibility = "visible";
			label.position.set(x, 5, z);
			label.position.z -= 3;
			this.scene.add(label)
		},
		createLightPillar(x, z, heightScaleFactor = 1) {
			let group = new THREE.Group();
			// 柱体高度
			const height = heightScaleFactor;
			// 柱体的geo,6.19=柱体图片高度/宽度的倍数
			const geometry = new THREE.PlaneGeometry(
				height / 6.219,
				height
			);
			// 柱体旋转90度，垂直于Y轴
			// geometry.rotateX(Math.PI / 2)
			// 柱体的z轴移动高度一半对齐中心点
			geometry.translate(0, height / 2, 0);
			// 柱子材质
			const material = new THREE.MeshBasicMaterial({
				map: textureLoader.load(require("./mapimg/光柱.png")),
				color: 0x00ffff,
				transparent: true,
				depthWrite: false,
				// depthTest:false,
				side: THREE.DoubleSide,
			});
			// 光柱01
			let light01 = new THREE.Mesh(geometry, material);
			light01.renderOrder = 2;
			light01.name = "createLightPillar01";
			// 光柱02：复制光柱01
			let light02 = light01.clone();
			light02.renderOrder = 2;
			light02.name = "createLightPillar02";
			// 光柱02，旋转90°，跟 光柱01交叉
			light02.rotateY(Math.PI / 2);

			// 创建底部标点
			const bottomMesh = this.createPointMesh(1.5);

			// 创建光圈
			const lightHalo = this.createLightHalo(1.5);
			WaveMeshArr.push(lightHalo);
			// 将光柱和标点添加到组里
			group.add(bottomMesh, lightHalo, light01, light02);
			// 设置组对象的姿态
			// group = setMeshQuaternion(group, R, lon, lat)
			group.position.set(x, 4.01, z);
			return group;
		},
		createPointMesh(size) {
			// 标记点：几何体，材质，
			const geometry = new THREE.PlaneGeometry(1, 1);
			const material = new THREE.MeshBasicMaterial({
				map: textureLoader.load(require("./mapimg/标注.png")),
				color: 0x00ffff,
				side: THREE.DoubleSide,
				transparent: true,
				depthWrite: false, //禁止写入深度缓冲区数据
			});
			let mesh = new THREE.Mesh(geometry, material);
			mesh.renderOrder = 2;
			mesh.rotation.x = Math.PI / 2;
			mesh.name = "createPointMesh";
			// 缩放
			const scale = 1 * size;
			mesh.scale.set(scale, scale, scale);
			return mesh;
		},
		createLightHalo(size) {
			// 标记点：几何体，材质，
			const geometry = new THREE.PlaneGeometry(1, 1);
			const material = new THREE.MeshBasicMaterial({
				map: textureLoader.load(require("./mapimg/标注光圈.png")),
				color: 0x00ffff,
				side: THREE.DoubleSide,
				opacity: 0,
				transparent: true,
				depthWrite: false, //禁止写入深度缓冲区数据
			});
			let mesh = new THREE.Mesh(geometry, material);
			mesh.renderOrder = 2;
			mesh.name = "createLightHalo";
			mesh.rotation.x = Math.PI / 2;
			// 缩放
			const scale = 1.5 * size;
			mesh.size = scale; //自顶一个属性，表示mesh静态大小
			mesh.scale.set(scale, scale, scale);
			return mesh;
		},

		initParticle() {
			//设置范围
			let minX = -60;
			let maxX = 60;
			let minY = -10;
			let maxY = 30;
			let minZ = -60;
			let maxZ = 60;

			for (let i = 0; i < 15; i++) {
				const particle = this.createSequenceFrame({
					image: require("./mapimg/1.png"),
					width: 180,
					height: 189,
					frame: 9,
					column: 9,
					row: 1,
					speed: 0.5,
				});
				let particleScale = this.random(5, 10) / 100;
				particle.scale.set(
					particleScale,
					particleScale,
					particleScale
				);
				let x = this.random(minX, maxX);
				let y = this.random(minY, maxY);
				let z = this.random(minZ, maxZ);
				particle.position.set(x, y, z);
				particleArr.push(particle);
			}
			this.scene.add(...particleArr);
			return particleArr;
		},
		createSequenceFrame(opt) {
			// 默认参数
			let options = this.deepMerge(
				{
					image: "",
					width: 200, // 显示的宽度
					height: 200, // 显示的高度
					frame: 60, //总共的帧数
					column: 10, // 序列图的列
					row: 6, // 序列图的行
					speed: 0.5, // 速度
				},
				opt
			);
			let geometry = new THREE.PlaneGeometry(
				options.width,
				options.height
			); //矩形平面
			let texture = textureLoader.load(options.image); // 加载图片
			texture.repeat.set(1 / options.column, 1 / options.row); // 从图像上截图第一帧
			let material = new THREE.MeshBasicMaterial({
				map: texture,
				transparent: true,
				opacity: 1,
				side: THREE.DoubleSide,
				depthWrite: false, //是否对深度缓冲区有任何的影响
			});
			let mesh = new THREE.Mesh(geometry, material);

			let r = 0; // 当前行
			let c = 0; // 当前列
			let t = 0; // 时间
			mesh.updateSequenceFrame = (time) => {
				t += options.speed;
				if (t > options.frame) t = 0;
				c = options.column - Math.floor(t % options.column) - 1;
				r = Math.floor((t / options.column) % options.row);
				texture.offset.x = c / options.column; // 动态更新纹理偏移 播放关键帧动画
				texture.offset.y = r / options.row; // 动态更新纹理偏移 播放关键帧动画
			};

			return mesh;
		},
		random(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		isType(type, value) {
			return (
				Object.prototype.toString.call(value) ===
				`[object ${type}]`
			);
		},
		isObject(value) {
			return this.isType("Object", value);
		},

		initPoints() {
			var texture = new THREE.TextureLoader().load(
				require("./mapimg/gradient.png")
			);
			const positions = [];
			const colors = [];
			const geometry = new THREE.BufferGeometry();
			for (var i = 0; i < 10000; i++) {
				var vertex = new THREE.Vector3();
				vertex.x = Math.random() * 2 - 1;
				vertex.y = Math.random() * 2 - 1;
				vertex.z = Math.random() * 2 - 1;
				positions.push(vertex.x, vertex.y, vertex.z);
				var color = new THREE.Color();
				color.setHSL(
					Math.random() * 0.2 + 0.5,
					0.55,
					Math.random() * 0.25 + 0.55
				);
				colors.push(color.r, color.g, color.b);
			}
			geometry.setAttribute(
				"position",
				new THREE.Float32BufferAttribute(positions, 3)
			);
			geometry.setAttribute(
				"color",
				new THREE.Float32BufferAttribute(colors, 3)
			);
			var starsMaterial = new THREE.PointsMaterial({
				map: texture,
				size: 1,
				transparent: true,
				opacity: 1,
				vertexColors: true, //true：且该几何体的colors属性有值，则该粒子会舍弃第一个属性--color，而应用该几何体的colors属性的颜色
				blending: THREE.AdditiveBlending,
				sizeAttenuation: true,
			});
			stars = new THREE.Points(geometry, starsMaterial);
			stars.scale.set(300, 300, 300);
			this.scene.add(stars);
		},
		initFloor() {
			const geometry = new THREE.PlaneGeometry(400, 400);
			let texture = textureLoader.load(require("./mapimg/地板背景.png"));
			const material = new THREE.MeshPhongMaterial({
				color: 0xffffff,
				map: texture,
				// emissive:0xffffff,
				// emissiveMap:Texture,
				transparent: true,
				opacity: 1,
				depthTest: true,
				// roughness:1,
				// metalness:0,
				depthWrite: false,
				// side: THREE.DoubleSide
			});
			let plane = new THREE.Mesh(geometry, material);
			plane.rotateX(-Math.PI / 2);
			this.scene.add(plane);

			let rotatingApertureTexture = textureLoader.load(
				require("./mapimg/rotatingAperture.png")
			);
			let rotatingApertureerial = new THREE.MeshBasicMaterial({
				map: rotatingApertureTexture,
				transparent: true,
				opacity: 1,
				depthTest: true,
				depthWrite: false,
			});
			let rotatingApertureGeometry = new THREE.PlaneGeometry(
				100,
				100
			);
			rotatingApertureMesh = new THREE.Mesh(
				rotatingApertureGeometry,
				rotatingApertureerial
			);
			rotatingApertureMesh.rotateX(-Math.PI / 2);
			rotatingApertureMesh.position.y = 0.02;
			rotatingApertureMesh.scale.set(1.2, 1.2, 1.2);
			this.scene.add(rotatingApertureMesh);

			let rotatingPointTexture = textureLoader.load(
				require("./mapimg/rotating-point2.png")
			);
			let material2 = new THREE.MeshBasicMaterial({
				map: rotatingPointTexture,
				transparent: true,
				opacity: 1,
				depthTest: true,
				depthWrite: false,
			});

			rotatingPointMesh = new THREE.Mesh(
				rotatingApertureGeometry,
				material2
			);
			rotatingPointMesh.rotateX(-Math.PI / 2);
			rotatingPointMesh.position.y = 0.04;
			rotatingPointMesh.scale.set(1, 1, 1);
			this.scene.add(rotatingPointMesh);

			let circlePoint = textureLoader.load(require("./mapimg/circle-point.png"));
			let material3 = new THREE.MeshPhongMaterial({
				color: 0x00ffff,
				map: circlePoint,
				transparent: true,
				opacity: 1,
				depthWrite: false,
				// depthTest: false,
			});
			let plane3 = new THREE.PlaneGeometry(120, 120);
			let mesh3 = new THREE.Mesh(plane3, material3);
			mesh3.rotateX(-Math.PI / 2);
			mesh3.position.y = 0.06;
			this.scene.add(mesh3);
		},
		deepMerge(target, source) {
			target = this.deepClone(target);
			for (let key in source) {
				if (key in target) {
					// 对象的处理
					if (this.isObject(source[key])) {
						if (!this.isObject(target[key])) {
							target[key] = source[key];
						} else {
							target[key] = this.deepMerge(target[key], source[key]);
						}
					} else {
						target[key] = source[key];
					}
				} else {
					target[key] = source[key];
				}
			}
			return target;
		},
		deepClone(target, map = new Map()) {
			// target 不能为空，并且是一个对象
			if (target != null && this.isObject(target)) {
				// 在克隆数据前，进行判断是否克隆过,已克隆就返回克隆的值
				let cache = map.get(target);
				if (cache) {
					return cache;
				}
				// 判断是否为数组
				const isArray = Array.isArray(target);
				let result = isArray ? [] : {};
				// 将新结果存入缓存中
				cache = map.set(target, result);
				// 如果是数组
				if (isArray) {
					// 循环数组，
					target.forEach((item, index) => {
						// 如果item是对象，再次递归
						result[index] = this.deepClone(item, cache);
					});
				} else {
					// 如果是对象
					Object.keys(target).forEach((key) => {
						if (this.isObject(result[key])) {
							result[key] = this.deepClone(target[key], cache);
						} else {
							result[key] = target[key];
						}
					});
				}
				return result;
			} else {
				return target;
			}
		},
		/**
		 * @description 创建辅助坐标轴
		 */
		addHelper() {
			// 模拟相机视锥体的辅助对象
			let helper = new THREE.CameraHelper(this.camera);
			// this.scene.add(helper);
			//创建辅助坐标轴、轴辅助 （每一个轴的长度）
			let axisHelper = new THREE.AxesHelper(150);  // 红线是X轴，绿线是Y轴，蓝线是Z轴
			this.scene.add(axisHelper)
			// 坐标格辅助对象
			let gridHelper = new THREE.GridHelper(100, 30, 0x2C2C2C, 0x888888);
			this.scene.add(gridHelper);
		},
		/**
		 * @description 设置光源
		 */
		setLight() {
			// 环境光
			this.scene.add(new THREE.AmbientLight(0x7af4ff, 1.5));
			// 平行光
			let directionalLight1 = new THREE.DirectionalLight(0x7af4ff, 1);
			directionalLight1.position.set(-100, 10, -100);
			this.scene.add(directionalLight1);
			// 平行光
			let directionalLight2 = new THREE.DirectionalLight(0x7af4ff, 1);
			directionalLight2.position.set(100, 10, 100);
			this.scene.add(directionalLight2);
		},
		/**
		 * @description 创建性能监听器
		*/
		addStatus() {
			// 创建一个性能监听器
			this.stats = new Stats();
			// 将性能监听器添加到容器中
			this.container.appendChild(this.stats.dom);
		},
		/**
		 * @description 监听屏幕的大小改变，修改渲染器的宽高，相机的比例
		*/
		// 窗口变化
		onWindowSize() {
			labelRenderer.render(this.scene, this.camera);

			labelRenderer.setSize(
				this.container.clientWidth,
				this.container.clientHeight
			);
			// 更新摄像头
			this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
			// 更新摄像机的投影矩阵
			this.camera.updateProjectionMatrix();
			//更新渲染器
			this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
			// 设置渲染器的像素比
			this.renderer.setPixelRatio(window.devicePixelRatio)

		},
		/**
		* @description 动画执行函数
		*/
		animate() {
			if (rotatingApertureMesh) {
				rotatingApertureMesh.rotation.z += 0.0005;
			}
			if (rotatingPointMesh) {
				rotatingPointMesh.rotation.z -= 0.0005;
			}
			if (particleArr.length) {
				for (let i = 0; i < particleArr.length; i++) {
					particleArr[i].updateSequenceFrame();
					particleArr[i].position.y += 0.15;
					if (particleArr[i].position.y >= 30) {
						particleArr[i].position.y = -10;
					}
				}
			}
			if (WaveMeshArr.length) {
				WaveMeshArr.forEach(function (mesh) {
					mesh._s += 0.007;
					mesh.scale.set(
						mesh.size * mesh._s,
						mesh.size * mesh._s,
						mesh.size * mesh._s
					);
					if (mesh._s <= 1.5) {
						//mesh._s=1，透明度=0 mesh._s=1.5，透明度=1
						mesh.material.opacity = (mesh._s - 1) * 2;
					} else if (mesh._s > 1.5 && mesh._s <= 2) {
						//mesh._s=1.5，透明度=1 mesh._s=2，透明度=0
						mesh.material.opacity = 1 - (mesh._s - 1.5) * 2;
					} else {
						mesh._s = 1.0;
					}
				});
			}
			labelRenderer.render(this.scene, this.camera);
			if (stars) {
				stars.rotation.y += 0.0001;
			}
			uniforms2.u_time.value += 0.007;
			const delta = this.clock.getDelta();
			// mixer 动画更新
			if (this.mixer) {
				this.mixer.update(delta);
			}
			// 引擎自动更新渲染器
			requestAnimationFrame(this.animate);
			//update()函数内会执行camera.lookAt(x, y, z)
			this.controller.update(delta);
			// 更新性能监听器
			this.stats.update();
			// 重新渲染场景
			this.renderer.render(this.scene, this.camera);
		},
	},
};
</script>
<style>
#container {
	position: absolute;
	width: 100%;
	height: 100%;
}
</style>
