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
import { color } from 'd3';
// CinematicCamera是在透视摄影PerspectiveCamera封装而来，它称为第二人称视角游戏相机；即会在主人物视角的后方，可以看到人物动作的这个一个距离。
// 这种相机可以设置焦点哦, 突出想要关注的地方, 其他地方比较模糊
import { CinematicCamera } from "three/examples/jsm/cameras/CinematicCamera.js";

const radius = 100;
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
			gui: null,//GUI界面
			clock: new THREE.Clock(),// 创建一个clock对象，用于跟踪时间
			mouse: new THREE.Vector2(),//创建鼠标位置
			raycaster: null,//光线投射,用于进行鼠标拾取（在三维空间中计算出鼠标移过了什么物体）
			INTERSECTED: null,
			theta: 0,
			effectController: { //CinematicCamera相机参数
				focalLength: 15,
				// jsDepthCalculation: true,
				// shaderFocus: false,
				//
				fstop: 10,
				// maxblur: 1.0,
				//
				showFocus: false,
				focalDepth: 3,
				// manualdof: false,
				// vignetting: false,
				// depthblur: false,
				//
				// threshold: 0.5,
				// gain: 2.0,
				// bias: 0.5,
				// fringe: 0.7,
				//
				// focalLength: 35,
				// noise: true,
				// pentagon: false,
				//
				// dithering: 0.0001
			}
		};
	},
	mounted() {
		this.raycaster = new THREE.Raycaster()
		this.init()
		this.animate()  //如果引入了模型并存在动画，可在模型引入成功后加载动画
		window.addEventListener("resize", this.onWindowSize)
	},
	beforeUnmount() {
		console.log('beforeUnmount===============');
		// 销毁操作-清空场景、从DOM上删除渲染器等
		this.scene.remove(this.camera)
		// 停止渲染循环
		cancelAnimationFrame(this.animate)
		// 释放渲染器的内存
		this.renderer.forceContextLoss() // 强制上下文丢失
		// 释放所有相关内容
		this.renderer.dispose()
		if (this.gui) {
			this.gui.destroy()
			this.gui = null
		}

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
			// this.addHelper()
			this.setPMREMGenerator()
			this.setLight()
			this.addStatus()
			this.addMesh()
			this.matChanger()
			this.setGui()
			container.addEventListener("mousemove", this.onDocumentMouseMove);
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
			this.camera = new CinematicCamera(60, this.container.clientWidth / this.container.clientHeight, 1, 1000)

			// 设置相机位置
			this.camera.position.set(2, 1, 500)
			// 设置摄像头宽高比例
			this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
			// 设置摄像头投影矩阵
			this.camera.updateProjectionMatrix();
			// 设置相机视线方向
			// this.camera.lookAt(new THREE.Vector3(0, 10, 0))// 0, 0, 0 this.scene.position
			// 初始化焦距
			this.camera.setLens(5);
			// 将相机加入场景
			this.scene.add(this.camera)
			console.log('this.camera.postprocessing.bokeh_uniforms :>> ', this.camera, this.camera.postprocessing.bokeh_uniforms);

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
		 * @description 创建辅助坐标轴
		 */
		addHelper() {
			// 模拟相机视锥体的辅助对象
			let helper = new THREE.CameraHelper(this.camera);
			// this.scene.add(helper);
			//创建辅助坐标轴、轴辅助 （每一个轴的长度）
			let axisHelper = new THREE.AxesHelper(1000);  // 红线是X轴，绿线是Y轴，蓝线是Z轴
			this.scene.add(axisHelper)
			// 坐标格辅助对象
			let gridHelper = new THREE.GridHelper(1000, 30, 0x2C2C2C, 0x888888);
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
			const ambientLight = new THREE.AmbientLight(0xffffff, 1);
			this.scene.add(ambientLight);
			// 平行光
			const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
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
		* @description 监听鼠标移动
		*/
		onDocumentMouseMove(event) {
			// 取消事件的默认动作
			event.preventDefault();
			// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
			this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		},
		/**
		* @description 添加物体
		*/
		addMesh() {
			const geometry = new THREE.BoxGeometry(20, 20, 20)
			for (let i = 0; i < 1500; i++) {
				const object = new THREE.Mesh(
					geometry,
					// 不一样的颜色
					new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
				)
				// 位置 -400到400
				object.position.set(Math.random() * 800 - 400, Math.random() * 800 - 400, Math.random() * 800 - 400)
				this.scene.add(object)
			}
		},
		/**
		* @description 设置camera参数变化,将属性对象赋值到相机上
		*/
		matChanger() {
			// CinematicCamera主要参数在postprocessing中设置
			for (const e in this.effectController) {
				if (e in this.camera.postprocessing.bokeh_uniforms) {
					this.camera.postprocessing.bokeh_uniforms[e].value =
						this.effectController[e];
				}
			}

			this.camera.postprocessing.bokeh_uniforms["znear"].value = this.camera.near;
			this.camera.postprocessing.bokeh_uniforms["zfar"].value = this.camera.far;
			this.camera.setLens(
				this.effectController.focalLength,
				this.camera.frameHeight,
				this.effectController.fstop,
				this.camera.coc
			);
			this.effectController["focalDepth"] =
				this.camera.postprocessing.bokeh_uniforms["focalDepth"].value;
		},

		/**
		* @description GUI面板
		*/
		setGui() {
			this.gui = new GUI()
			this.gui.add(this.effectController, "focalLength", 1, 135, 0.01).onChange(this.matChanger)
			this.gui.add(this.effectController, "fstop", 1.8, 22, 0.01).onChange(this.matChanger)
			this.gui.add(this.effectController, "focalDepth", 0.1, 100, 0.001).onChange(this.matChanger)
			this.gui.add(this.effectController, "showFocus", true).onChange(this.matChanger)
		},
		/**
		* @description 动画执行函数
		*/
		animate() {
			this.theta += 0.1;

			this.camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(this.theta));
			this.camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(this.theta));
			this.camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(this.theta));
			this.camera.lookAt(this.scene.position);

			this.camera.updateMatrixWorld();
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
			// 通过摄像机和鼠标位置更新射线
			this.raycaster.setFromCamera(this.mouse, this.camera);
			// 计算物体和射线的焦点
			const intersects = this.raycaster.intersectObjects(this.scene.children);
			if (intersects.length > 0) {
				const targetDistance = intersects[0].distance;
				this.camera.focusAt(targetDistance); // using Cinematic camera focusAt method

				if (this.INTERSECTED != intersects[0].object) {
					if (this.INTERSECTED) { this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex); }
					this.INTERSECTED = intersects[0].object;
					this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
					// MeshLambertMaterial的属性emissive
					// 材质的放射（光）颜色，基本上是不受其他光照影响的固有颜色。默认为黑色。
					this.INTERSECTED.material.emissive.setHex(0xff0000);
				}
			} else {
				if (this.INTERSECTED) { this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex); }
				this.INTERSECTED = null;
			}
			if (this.camera.postprocessing.enabled) {
				this.camera.renderCinematic(this.scene, this.renderer);
			} else {
				this.scene.overrideMaterial = null;
				this.renderer.clear();
				// 重新渲染场景
				this.renderer.render(this.scene, this.camera);
			}
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
