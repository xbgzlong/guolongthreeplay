<template>
	<div>
		<div id="container"></div>
	</div>
</template>

<script>
import * as THREE from "three";
// 导入控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
// 性能
import Stats from 'three/examples/jsm/libs/stats.module.js';

// 导入gltf载入库
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// 引入模型解压器
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
//GUI界面
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import gsap from 'gsap';
let idleAction, walkAction, runAction;
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
			skeleton: null, //模拟骨骼的辅助对象
			settings: {},//GUI设置
			actions: null,//模型动作合集
			panel: null,//属性面板
			singleStepMode: false,//单步模式
			clock: new THREE.Clock()// 创建一个clock对象，用于跟踪时间
		};
	},
	mounted() {
		this.init()
		// this.animate()//如果引入了模型并存在动画，可在模型引入成功后加载动画
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
		this.skeleton = null//模拟骨骼的辅助对象
		this.settings = {}//GUI设置
		this.actions = null//模型动作合集
		this.panel = null
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
			// this.setPMREMGenerator()
			this.setLight()
			this.addGround()
			this.setGltfLoader()
			this.addStatus()
		},
		/**
		 * @description 创建场景
		 */
		setScene() {
			//  创建场景对象Scene
			this.scene = new THREE.Scene()
			// 设置场景背景
			this.scene.background = new THREE.Color(0xa0a0a0);
			this.scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
		},
		/**
		 * @description 创建相机
		 */
		setCamera() {
			// 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
			this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 1, 100)
			// 设置相机位置
			this.camera.position.set(1, 2, -3)
			// 设置摄像头宽高比例
			this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
			// 设置摄像头投影矩阵
			this.camera.updateProjectionMatrix();
			// 设置相机视线方向
			this.camera.lookAt(0, 1, 0)// 0, 0, 0 this.scene.position
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
			// 告诉渲染器需要阴影效果
			this.renderer.shadowMap.enabled = true;
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
			this.controller.target.set(0, 1, 0); //控制器的焦点
		},

		/**
		 * @description 设置光源
		 */
		setLight() {
			const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
			hemiLight.position.set(0, 20, 0);
			this.scene.add(hemiLight);
			const dirLight = new THREE.DirectionalLight(0xffffff, 3);
			dirLight.position.set(- 3, 10, - 10);
			// castShadow 设置为 true 灯光将投射阴影
			dirLight.castShadow = true;
			// 阴影产生面积
			// (left — 摄像机视锥体左侧面。
			// right — 摄像机视锥体右侧面。
			// top — 摄像机视锥体上侧面。
			// bottom — 摄像机视锥体下侧面。
			// near — 摄像机视锥体近端面。
			// far — 摄像机视锥体远端面。)
			dirLight.shadow.camera.top = 2;
			dirLight.shadow.camera.bottom = - 2;
			dirLight.shadow.camera.left = - 2;
			dirLight.shadow.camera.right = 2;
			dirLight.shadow.camera.near = 0.1;
			dirLight.shadow.camera.far = 40;
			this.scene.add(dirLight);
		},
		/**
		 * @description 添加地面
		 */
		addGround() {
			// PlaneGeometry（平面几何体）
			// MeshPhongMaterial(一种用于具有镜面高光的光泽表面的材质)
			const mesh = new THREE.Mesh(
				new THREE.PlaneGeometry(100, 100),
				new THREE.MeshPhongMaterial({
					color: 0xcbcbcb,
					depthWrite: false
				})
			)
			mesh.rotation.x = - Math.PI / 2;
			// 设置平面需要接收阴影
			mesh.receiveShadow = true;
			this.scene.add(mesh)
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
			loader.load('/model/gltf/Soldier.glb', (gltf) => {
				that.model = gltf.scene
				that.scene.add(that.model)
				// 对象是否被渲染到阴影贴图中
				that.model.traverse(function (object) {
					if (object.isMesh) {
						//告诉模型需要投射阴影
						object.castShadow = true
					}
				})
				// 模拟骨骼 Skeleton 的辅助对象
				that.skeleton = new THREE.SkeletonHelper(that.model);
				that.skeleton.visible = false;
				that.scene.add(that.skeleton);

				// 设置GUI配置
				that.createPanel()

				//model导入的动画,为一个数组对象
				const animations = gltf.animations

				// 绑定model的动画混合器
				// 动画混合器(AnimationMixer)是用于场景中特定对象的动画的播放器。
				// 当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器。
				that.mixer = new THREE.AnimationMixer(that.model)
				// 设置剪辑动画
				idleAction = that.mixer.clipAction(animations[0])  // idle
				walkAction = that.mixer.clipAction(animations[3]); // idle
				runAction = that.mixer.clipAction(animations[1]); // walk

				// 模型动作合集
				that.actions = [idleAction, walkAction, runAction];

				// 开始所有的动作/动画
				that.activateAllActions();

				// 执行动画
				that.animate();
			}, undefined, (err => {
				console.error(err)
			}))

		},
		/**
		 * @description GUI配置
		 */
		createPanel() {
			//GUI配置
			this.panel = new GUI({ width: 310 })

			const floder1 = this.panel.addFolder('Visibility')//是否可见
			const floder2 = this.panel.addFolder('Activation/Deactivation') // 开始/停止
			const folder3 = this.panel.addFolder('Pausing/Stepping'); // 暂停 / 步进
			const folder4 = this.panel.addFolder('Crossfading');//淡入淡出
			const folder5 = this.panel.addFolder('Blend Weights');//混合权重
			const folder6 = this.panel.addFolder('General Speed');//速度

			this.settings = {
				'show model': true,
				'show skeleton': false,
				'deactive all': this.deactivateAllActions,
				'activate all': this.activateAllActions,
				'pause/continue': this.pauseContinue,

				'modify idle weight': 0.0,
				'modify walk weight': 1.0,
				'modify run weight': 0.0,
			}

			floder1.add(this.settings, 'show model').onChange(this.showModel)//是否展示模型
			floder1.add(this.settings, 'show skeleton').onChange(this.showSkeleton)//是否展示骨骼模拟

			floder2.add(this.settings, 'deactive all') //停止所有的动作/动画
			floder2.add(this.settings, 'activate all')//开始所有的动作/动画

			folder5.add(this.settings, 'modify idle weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
				this.setWeight(idleAction, weight)
			})
			folder5.add(this.settings, 'modify walk weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
				this.setWeight(walkAction, weight)
			})
			folder5.add(this.settings, 'modify run weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
				this.setWeight(runAction, weight)
			})
		},
		/**
		 * @description 是否展示模型
		 * @param {boolean} visibility
		 */
		showModel(visibility) {
			this.model.visible = visibility;
		},
		/**
		 * @description 是否展示骨骼模拟
		 * @param {boolean} visibility
		 */
		showSkeleton(visibility) {
			this.skeleton.visible = visibility
		},
		/**
		 * @description 停止所有的动作/动画
		 */
		deactivateAllActions() {
			this.actions.forEach(action => {
				action.stop()
			});
		},
		/**
		 * @description 开始所有的动作/动画
		 */
		activateAllActions() {
			this.setWeight(idleAction, this.settings['modify idle weight']);
			this.setWeight(walkAction, this.settings['modify walk weight']);
			this.setWeight(runAction, this.settings['modify run weight']);

			this.actions.forEach(function (action) {
				action.play();
			});
		},

		pauseContinue() {

		},


		/**
		 *
		 * @param {object} action
		 * @param {number} weight
		 * @description 设置动画的权重(weight)和时间比例(timeScale)
		 */
		// 说明: 将enabled置为true不会让动画自动重新开始。只有满足以下条件时才会马上重新开始: 暂停（paused）值为false, 同时动作没有失效 (执行停止(stop)命令或重置(reset)命令，且权重(weight)和时间比例(timeScale)都不能为0
		setWeight(action, weight) {
			// 动画将从当前时间（time）继续
			action.enabled = true
			// 设置时间比例（timeScale）以及停用所有的变形
			action.setEffectiveTimeScale(1);
			// 设置权重（weight）以及停止所有淡入淡出
			// 如果启用属性（enabled）为true, 那么有效权重(一个内部属性) 也会被设为该值; 否则有效权重 (直接影响当前动画)将会被设为0.
			action.setEffectiveWeight(weight);
		},











		/**
		 * @description 创建辅助坐标轴
		 */
		addHelper() {
			let helper = new THREE.CameraHelper(this.camera);
			// this.scene.add(helper);

			//创建辅助坐标轴、轴辅助 （每一个轴的长度）
			let axisHelper = new THREE.AxesHelper(150);  // 红线是X轴，绿线是Y轴，蓝线是Z轴
			this.scene.add(axisHelper);

			let gridHelper = new THREE.GridHelper(100, 30, 0x2C2C2C, 0x888888);
			// this.scene.add(gridHelper);
		},
		/**
		 * @description 给场景添加环境光效果
		 */
		setPMREMGenerator() {
			// 预过滤的Mipmapped辐射环境贴图
			const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
			this.scene.background = new THREE.Color(0xbfe3dd);
			this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(this.renderer), 0.04).texture;
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
		// 动画
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
