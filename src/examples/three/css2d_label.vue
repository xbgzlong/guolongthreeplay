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
			mixer: null,//动画混合器
			model: null,//导入的模型
			clock: new THREE.Clock()// 创建一个clock对象，用于跟踪时间
		};
	},
	mounted() {
		this.init()
		// this.animate()  //如果引入了模型并存在动画，可在模型引入成功后加载动画
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
			this.setPMREMGenerator()
			this.setLight()
			this.setGltfLoader()
			this.addStatus()
		},
		/**
		 * @description 创建场景
		 */
		setScene() {
			// 创建场景对象Scene
			this.scene = new THREE.Scene()
			// 设置场景背景
			this.scene.background = new THREE.Color(0xbfe3dd);
		},
		/**
		 * @description 创建相机
		*/
		setCamera() {
			// 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
			this.camera = new THREE.PerspectiveCamera(60, this.container.clientWidth / this.container.clientHeight, 1, 100)
			// 设置相机位置
			this.camera.position.set(5, 2, 8)
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
			// 是否需要对对象排序
			// this.renderer.sortObjects = false;
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
		setGltfLoader() {
			let that = this
			// 添加模型
			// 实例化gltf载入库
			const loader = new GLTFLoader();
			// 实例化draco载入库
			const dracoLoader = new DRACOLoader();
			// 添加draco载入库
			dracoLoader.setDecoderPath("/draco/gltf/");
			// 添加draco载入库
			loader.setDRACOLoader(dracoLoader);
			loader.load('/model/gltf/LittlestTokyo.glb', (gltf) => {
				that.model = gltf.scene
				that.model.position.set(1, 1, 0)
				that.model.scale.set(0.01, 0.01, 0.01)
				that.scene.add(that.model)
				// 绑定model的动画混合器
				// 动画混合器(AnimationMixer)是用于场景中特定对象的动画的播放器。
				// 当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器。
				that.mixer = new THREE.AnimationMixer(that.model)
				//设置剪辑动画
				that.mixer.clipAction(gltf.animations[0]).play()
				// 执行动画
				that.animate();
			}, undefined, (err => {
				console.error(err)
			}))
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
			const ambientLight = new THREE.AmbientLight(0x404040, 4);
			// this.scene.add(ambientLight);
			// 平行光
			const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
			// this.scene.add(directionalLight);
			// 点光源 - 照模型
			const test = new THREE.PointLight("#ffffff", 10, 2);
			// test.position.set(0, 0, 0);
			// this.scene.add(test);
			//点光源 - 辅助对象
			const testHelperMap = new THREE.PointLightHelper(test);
			// this.scene.add(testHelperMap);
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
