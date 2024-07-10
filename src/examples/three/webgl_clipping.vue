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
export default {
	data() {
		return {
			container: null, //界面需要渲染的容器
			scene: null,	// 场景对象
			camera: null, //相机对象
			renderer: null, //渲染器对象
			controller: null,	// 相机控件对象
			stats: null,// 性能监听器
			model: null,//导入的模型
			clock: new THREE.Clock(),// 创建一个clock对象，用于跟踪时间
			startTime: null,
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
		this.object = null//物体实列对象
	},
	methods: {
		/**
		* @description 初始化
		 */
		init() {
			this.container = document.getElementById('container')
			this.startTime = Date.now();
			this.setScene()
			this.setCamera()
			this.setRenderer()
			this.setController()
			this.addHelper()
			// this.setPMREMGenerator()
			this.setLight()
			this.setMesh()
			this.addStatus()
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
			this.camera = new THREE.PerspectiveCamera(36, this.container.clientWidth / this.container.clientHeight, 0.25, 16)
			// 设置相机位置
			this.camera.position.set(0, 1.3, 5)
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
				logarithmicDepthBuffer: true,  // 是否使用对数深度缓存
			})
			// 设置渲染器宽高
			this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
			// 设置渲染器的像素比
			this.renderer.setPixelRatio(window.devicePixelRatio);
			// 允许在场景中使用阴影贴图
			this.renderer.shadowMap.enabled = true;
			// 定义渲染器是否考虑对象级剪切平面
			this.renderer.localClippingEnabled = true;
			// 是否需要对对象排序
			this.renderer.sortObjects = false;
			// 将渲染器添加到页面
			this.container.appendChild(this.renderer.domElement);

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
			// 由于设置了控制器，因此只能改变控制器的target以改变相机的lookAt方向
			this.controller.target.set(0, 1, 0); //控制器的焦点
		},
		/**
		* @description 添加创建模型
		*/
		setMesh() {
			// ***** Clipping planes: *****
			const localPlane = new THREE.Plane(new THREE.Vector3(0, - 1, 0), 0.8);

			// 创建物体
			const material = new THREE.MeshPhongMaterial({
				color: 0x80ee10,
				shininess: 100,
				side: THREE.DoubleSide,//渲染哪一面,双面
				// ***** Clipping setup (material): *****
				clippingPlanes: [localPlane],//定义剪裁平面,需要WebGLRenderer.localClippingEnabled为true。
				clipShadows: true,//是否根据此材质上指定的剪裁平面剪切阴影
			})
			// 创建一个圆环扭结
			const geometry = new THREE.TorusKnotGeometry(0.4, 0.08, 95, 20);
			this.object = new THREE.Mesh(geometry, material);
			this.object.castShadow = true;// 对象是否被渲染到阴影贴图中

			this.object.position.y = 0.8;
			// 将物体加入场景
			this.scene.add(this.object);

			// 创建地面
			// PlaneGeometry（平面几何体）
			// MeshPhongMaterial(一种用于具有镜面高光的光泽表面的材质)
			const ground = new THREE.Mesh(
				new THREE.PlaneGeometry(9, 9, 1, 1),
				new THREE.MeshPhongMaterial({ color: 0xa0adaf, shininess: 150 })
			);

			ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
			ground.receiveShadow = true;//材质是否接收阴影
			this.scene.add(ground);


			// ***** Clipping setup (renderer): *****
			const globalPlane = new THREE.Plane(new THREE.Vector3(- 1, 0, 0), 0.1);
			const globalPlanes = [globalPlane];
			const Empty = Object.freeze([]);
			this.renderer.clippingPlanes = Empty; // GUI sets it to globalPlanes.用户自定义的剪裁平面，在世界空间中被指定为THREE.Plane对象。 这些平面全局使用。空间中与该平面点积为负的点将被切掉。 默认值是[]
			this.renderer.localClippingEnabled = true;//定义渲染器是否考虑对象级剪切平面

			// GUI
			const gui = new GUI()
			const folderLocal = gui.addFolder('Local Clipping')
			const propsLocal = {
				'Enable': this.renderer.localClippingEnabled,
				// 'Shadows': material.clipShadows,
				// 'Plane': localPlane.constant,
				// get 'Enable'() {
				// 	return this.renderer.localClippingEnabled
				// },
				// set 'Enable'(v) {
				// 	this.renderer.localClippingEnabled = v
				// },
				get 'Shadows'() {
					return material.clipShadows;
				},
				set 'Shadows'(v) {
					material.clipShadows = v;
				},
				get 'Plane'() {
					return localPlane.constant;//原点到平面有符号距离
				},
				set 'Plane'(v) {
					localPlane.constant = v;
				}
			}

			const folderGlobal = gui.addFolder('Global Clipping')
			const propsGlobal = {
				'Enable': this.renderer.clippingPlanes !== Empty,
				// get 'Enabled'() {
				// 	return this.renderer.clippingPlanes !== Empty;
				// },
				// set 'Enabled'(v) {
				// 	this.renderer.clippingPlanes = v ? globalPlanes : Empty;
				// },
				get 'Plane'() {
					return globalPlane.constant;
				},
				set 'Plane'(v) {
					globalPlane.constant = v;
				}
			};

			folderLocal.add(propsLocal, 'Enable').listen().onChange((v) => {
				this.renderer.localClippingEnabled = v
			})
			// folderLocal.add(propsLocal, 'Enabled');
			folderLocal.add(propsLocal, 'Shadows');
			folderLocal.add(propsLocal, 'Plane', 0.3, 1.5);

			folderGlobal.add(propsGlobal, 'Enable').listen().onChange((v) => {
				this.renderer.clippingPlanes = v ? globalPlanes : Empty;
			})
			// folderGlobal.add(propsGlobal, 'Enabled');
			folderGlobal.add(propsGlobal, 'Plane', - 0.4, 3);
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
		 * @description 给场景添加环境光效果
		 */
		setPMREMGenerator() {
			// 预过滤的Mipmapped辐射环境贴图
			const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
			this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(this.renderer), 0.04).texture;
		},
		/**
		 * @description 设置光源
		 */
		setLight() {
			// 环境光
			const ambientLight = new THREE.AmbientLight(0xcccccc);
			this.scene.add(ambientLight);
			// 聚光灯
			const spotLight = new THREE.SpotLight(0xffffff, 60);
			spotLight.angle = Math.PI / 5;
			spotLight.penumbra = 0.2;
			spotLight.position.set(2, 3, 3);
			spotLight.castShadow = true;
			spotLight.shadow.camera.near = 3;
			spotLight.shadow.camera.far = 10;
			spotLight.shadow.mapSize.width = 1024;
			spotLight.shadow.mapSize.height = 1024;
			this.scene.add(spotLight);

			// 平行光
			const directionalLight = new THREE.DirectionalLight(0x55505a, 3.0);

			directionalLight.position.set(0, 3, 0);
			directionalLight.castShadow = true;
			directionalLight.shadow.camera.near = 1;
			directionalLight.shadow.camera.far = 10;

			directionalLight.shadow.camera.right = 1;
			directionalLight.shadow.camera.left = - 1;
			directionalLight.shadow.camera.top = 1;
			directionalLight.shadow.camera.bottom = - 1;

			directionalLight.shadow.mapSize.width = 1024;
			directionalLight.shadow.mapSize.height = 1024;
			this.scene.add(directionalLight);
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
			const currentTime = Date.now();
			const time = (currentTime - this.startTime) / 1000;
			this.object.rotation.x = time * 0.5;
			this.object.rotation.y = time * 0.2;
			this.object.scale.setScalar(Math.cos(time) * 0.125 + 0.875);
			// 引擎自动更新渲染器
			requestAnimationFrame(this.animate);
			//update()函数内会执行camera.lookAt(x, y, z)
			this.controller.update();
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
