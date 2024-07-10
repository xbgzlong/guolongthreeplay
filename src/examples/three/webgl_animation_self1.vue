<template>
	<div>
		<div id="container" style="height: 50%; width: 50%;margin: 20%;"></div>
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
const AMOUNT = 1;
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
			mesh: null,//导入的模型
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
		this.mesh = null//导入的模型
	},
	methods: {
		/**
		* @description 初始化
		 */
		init() {
			this.container = document.getElementById('container')
            // 设置场景
			this.setScene()
            // 设置摄像头
			this.setCamera()
            // 设置渲染器
			this.setRenderer()
            // 设置控制器
			this.setController()
            // 设置坐标系辅助对象
			this.addHelper()
			// this.setPMREMGenerator()
            // 设置灯光
			this.setLight()
            // 往场景中放置物体模型
			this.setGltfLoader()
            // 设置监视器
			this.addStatus()
		},
		/**
		 * @description 创建场景
		 */
		setScene() {
			// 创建场景对象Scene
			this.scene = new THREE.Scene()
			// 设置场景背景
			this.scene.background = new THREE.Color(0xff0000);
		},
		/**
		 * @description 创建相机
		*/
		setCamera() {
			const ASPECT_RATIO = this.container.clientWidth / this.container.clientHeight
			const WIDTH = (this.container.clientWidth / AMOUNT) * window.devicePixelRatio;
			const HEIGHT = (this.container.clientHeight / AMOUNT) * window.devicePixelRatio;
			const cameras = [];

			for (let y = 0; y < AMOUNT; y++) {
				for (let x = 0; x < AMOUNT; x++) {
					// 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
					const subcamera = new THREE.PerspectiveCamera(40, ASPECT_RATIO, 0.1, 10)
					//设置视窗位置及大小
					subcamera.viewport = new THREE.Vector4(Math.floor(x * WIDTH), Math.floor(y * HEIGHT), Math.ceil(WIDTH), Math.ceil(HEIGHT));

					// 设置相机位置
					subcamera.position.x = (x / AMOUNT) + 2.5;
					subcamera.position.y = 2.5 - (y / AMOUNT);
					subcamera.position.z = 2.5;

					subcamera.position.multiplyScalar(2);
					// 设置相机视线方向
					subcamera.lookAt(0, 0, 0);
					//更新相机的矩阵
					subcamera.updateMatrixWorld();
					cameras.push(subcamera);
				}
			}
			this.camera = new THREE.ArrayCamera(cameras);
			this.camera.position.z = 3;
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
			// 告诉渲染器需要阴影效果
			this.renderer.shadowMap.enabled = true;
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
			this.controller.minDistance = 1;
			this.controller.maxDistance = 5;
			//是否开启右键拖拽
			this.controller.enablePan = true;
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
		* @description 添加创建物体
		*/
		setGltfLoader() {
			// 添加模型
			const geometryBackground = new THREE.PlaneGeometry(100, 100);
			const materialBackground = new THREE.MeshPhongMaterial({ color: 0x000000 });

			const background = new THREE.Mesh(geometryBackground, materialBackground);
			background.receiveShadow = true;
			background.position.set(0, 0, - 1);
			this.scene.add(background);
			// const geometryCylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
			// const materialCylinder = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            //创建一个空的几何体对象
            const geometry = new THREE.BufferGeometry(); 
            //类型化数组创建顶点数据
            const vertices = new Float32Array([
                0, 0, 0, //顶点1坐标
                50, 0, 0, //顶点2坐标
                0, 50, 0, //顶点3坐标
                0, 0, 10, //顶点4坐标
                0, 0, 50, //顶点5坐标
                50, 0, 10, //顶点6坐标
            ]);
          
            // 创建属性缓冲区对象
            //3个为一组，表示一个顶点的xyz坐标
            const attribue = new THREE.BufferAttribute(vertices, 3); 
            // 设置几何体attributes属性的位置属性
            geometry.attributes.position = attribue;
              // 点渲染模式
            const material = new THREE.PointsMaterial({
                color: 0xffff00,
                size: 10.0 //点对象像素尺寸
            }); 


			this.mesh = new THREE.Mesh(geometry, material);
			this.mesh.castShadow = true;
			this.mesh.receiveShadow = true;
			this.scene.add(this.mesh);
		},
		/**
		 * @description 创建辅助坐标轴
		 */
		addHelper() {
			// 模拟相机视锥体的辅助对象
			let helper = new THREE.CameraHelper(this.camera);
			// this.scene.add(helper);
			//创建辅助坐标轴、轴辅助 （每一个轴的长度）
			let axisHelper = new THREE.AxesHelper(150);  // 红线是X轴，绿线是Y轴，蓝线是Z轴`
			this.scene.add(axisHelper)
			// 坐标格辅助对象
			let gridHelper = new THREE.GridHelper(100, 30, 0x2C2C2C, 0x888888);
			// this.scene.add(gridHelper);
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
			const ambientLight = new THREE.AmbientLight(0x999999, 1);
			this.scene.add(ambientLight);
			// 平行光
			const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
			directionalLight.position.set(0.5, 0.5, 1);
			directionalLight.castShadow = true;
			directionalLight.shadow.camera.zoom = 4; // tighter shadow map
			this.scene.add(directionalLight);
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
			const ASPECT_RATIO = this.container.clientWidth / this.container.clientHeight;
			const WIDTH = (this.container.clientWidth / AMOUNT) * window.devicePixelRatio;
			const HEIGHT = (this.container.clientHeight / AMOUNT) * window.devicePixelRatio;


			// 更新相机视锥体的长宽比
			this.camera.aspect = ASPECT_RATIO;
			// 更新摄像机的投影矩阵
			this.camera.updateProjectionMatrix();
			// 更新相机聚焦视角
			for (let y = 0; y < AMOUNT; y++) {

				for (let x = 0; x < AMOUNT; x++) {

					const subcamera = this.camera.cameras[AMOUNT * y + x];

					subcamera.viewport.set(
						Math.floor(x * WIDTH),
						Math.floor(y * HEIGHT),
						Math.ceil(WIDTH),
						Math.ceil(HEIGHT));

					subcamera.aspect = ASPECT_RATIO;
					subcamera.updateProjectionMatrix();

				}

			}
			//更新渲染器
			this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
			// 设置渲染器的像素比
			this.renderer.setPixelRatio(window.devicePixelRatio)
		},
		/**
		* @description 动画执行函数
		*/
		animate() {

			this.mesh.rotation.x += 0.01;
			this.mesh.rotation.z += 0.01;
            this.mesh.rotation.y += 0.01;
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
