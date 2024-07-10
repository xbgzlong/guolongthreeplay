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
// 骨架工具(模型克隆)
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

let idleAction, walkAction, runAction;
const crossFadeControls = [];

let panelSettings, numAnimations;
let currentBaseAction = 'idle';
//基础动作配置
let baseActions = {
	idle: { weight: 1 },
	walk: { weight: 0 },
	run: { weight: 0 }
}

//其他动作配置
let additiveActions = {
	sneak_pose: { weight: 0 },
	sad_pose: { weight: 0 },
	agree: { weight: 0 },
	headShake: { weight: 0 }
}
const allActions = [];
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
			// this.setPMREMGenerator()
			this.setLight()
			this.setGltfLoader()
			this.addStatus()
			this.addGround()
		},
		/**
		 * @description 创建场景
		 */
		setScene() {
			// 创建场景对象Scene
			this.scene = new THREE.Scene()
			// 设置场景背景
			this.scene.background = new THREE.Color(0xa0a0a0);
			this.scene.fog = new THREE.Fog(0xa0a0a0, 10, 50)
		},
		/**
		 * @description 创建相机
		*/
		setCamera() {
			// 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
			this.camera = new THREE.PerspectiveCamera(40, this.container.clientWidth / this.container.clientHeight, 1, 100)
			// 设置相机位置
			this.camera.position.set(-1, 2, 3);
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
			this.renderer.shadowMap.enabled = true
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
			loader.load('/model/gltf/Xbot.glb', (gltf) => {
				//以一个object3D对象作为第一个参数的函数
				gltf.scene.traverse(function (object) {
					// 对象是否被渲染到阴影贴图中
					if (object.isMesh) {
						object.castShadow = true
					}
				})
				that.model = gltf.scene
				that.model.position.set(0, 0, 0)
				that.scene.add(that.model)

				// 模拟骨骼 Skeleton 的辅助对象
				that.skeleton = new THREE.SkeletonHelper(that.model)
				that.skeleton.visible = false
				that.scene.add(that.skeleton)


				//model导入的动画,为一个数组对象
				const animations = gltf.animations

				// 动画混合器(AnimationMixer)是用于场景中特定对象的动画的播放器。当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器。
				// 通过创建动画混合器实例，实现要做动画的物体(model)与动画关联起来
				that.mixer = new THREE.AnimationMixer(that.model)

				numAnimations = animations.length

				//根据动作配置来添加到动画混合器
				for (let i = 0; i < numAnimations; i++) {
					let clip = animations[i]
					const name = clip.name
					if (baseActions[name]) {
						// AnimationMixer.clipAction将会实例化一个 AnimationAction

						// 执行动画混合器的clipAction()方法，该方法接收一个参数，将上面创建的clip作为参数传入
						// 其返回所传入的剪辑参数的 AnimationAction ，定义一个变量 action 用于接收返回的AnimationAction

						// 设置剪辑实例动作，实现动画剪辑( clip 或 通过 AnimationClip 创建的动画)与动画混合器的关联
						const action = that.mixer.clipAction(clip)
						// 激活动作
						that.activateAction(action);
						// 将动作存储在对应数组中
						baseActions[name].action = action
						// 模型动作的合集
						allActions.push(action)
					} else if (additiveActions[name]) {
						// Make the clip additive and remove the reference frame
						// 添加剪辑并移除参考框架
						// 将给定动画剪辑的关键帧转换为附加格式。
						THREE.AnimationUtils.makeClipAdditive(clip)
						if (clip.name.endsWith('_pose')) {
							// 创建一个新的片段，仅包含所给定帧之间的原始剪辑片段。
							clip = new THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30)
						}
						// 设置剪辑实例动作
						const action = that.mixer.clipAction(clip)
						// 激活动作
						that.activateAction(action)
						// 将动作存储在对应数组中
						additiveActions[name].action = action
						// 模型动作的合集
						allActions.push(action)
					}
				}

				// 设置GUI配置
				that.createPanel()

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
			const panel = new GUI({ width: 310 })
			//addFolder 向GUI添加一个文件夹
			const folder0 = panel.addFolder('Visibility')//是否可见
			const folder1 = panel.addFolder('Base Actions');//基础操作
			const folder2 = panel.addFolder('Additive Action Weights');//附加动作权重
			const folder3 = panel.addFolder('General Speed');//速度
			panelSettings = {
				'modify time scale': 1.0	//修改时间尺度
			};
			this.settings = {
				'show model': true,//是否展示模型
				'show skeleton': false,//是否展示骨骼模拟
			}
			// 添加控制器到GUI
			folder0.add(this.settings, 'show model').onChange(this.showModel)//是否展示模型
			folder0.add(this.settings, 'show skeleton').onChange(this.showSkeletons)//是否展示骨骼模拟

			const baseName = ['None', ...Object.keys(baseActions)] //基础动作名称

			//循环添加baseActions的GUI配置
			for (let i = 0; i < baseName.length; i++) {
				const name = baseName[i];
				const settings = baseActions[name]
				// 将panelSettings[name]结果设置为函数
				panelSettings[name] = () => {
					const currentSettings = baseActions[currentBaseAction]
					const currentAction = currentSettings ? currentSettings.action : null
					const action = settings ? settings.action : null
					if (currentAction !== action) {
						this.prepareCrossFade(currentAction, action, 0.35);
					}
				}
				crossFadeControls.push(folder1.add(panelSettings, name));
			}
			//循环设置附加动作权重
			for (const name of Object.keys(additiveActions)) {
				const settings = additiveActions[name]
				panelSettings[name] = settings.weight  // panelSettings = {'sneak_pose': 0, 'sad_pose': 0, 'agree': 0, 'headShake': 0}
				// 添加控制器到GUI，最小为 0.0 ，最大为 1.0 , 步长为 0.01
				folder2.add(panelSettings, name, 0.0, 1.0, 0.01).listen().onChange((weight) => {
					this.setWeight(settings.action, weight)
					settings.weight = weight
				})

			}
			//修改动画混合器的时间尺度
			folder3.add(panelSettings, 'modify time scale', 0.0, 1.0, 0.01).listen().onChange((speed) => {
				this.mixer.timeSacle = speed
			})

			// 打开GUI文件夹
			folder0.open();
			folder1.open();
			folder2.open();
			folder3.open();
			crossFadeControls.forEach(function (control) {
				// 通过domElement元素的classList方法操作css
				// 将按钮置为灰色
				control.setInactive = function () {
					//追加一个类
					control.domElement.classList.add('control-inactive');
				};
				control.setActive = function () {
					//删除一个类
					control.domElement.classList.remove('control-inactive');
				};
				const settings = baseActions[control.property];
				// 设置当前动作按钮状态
				if (!settings || !settings.weight) {
					control.setInactive();
				}

			});
		},
		/**
		 * @description 是否展示模型
		 * @param {boolean} visibility
		 */
		showModel(visibility) {
			this.model.visible = visibility
		},
		/**
		 * @description 是否展示骨骼模拟
		 * @param {boolean} visibility
		 */
		showSkeletons(visibility) {
			this.skeleton.visible = visibility
		},
		/**
		 * @param {object} action 剪辑实例动作对象
		 * @description 激活动作
		 */
		activateAction(action) {
			// getClip 返回存有此动作的动画数据的剪辑 <==>action._clip
			const clip = action.getClip();
			// 获取动作对象上的基础设置
			const settings = baseActions[clip.name] || additiveActions[clip.name];
			// 设置动作的影响程度
			this.setWeight(action, settings.weight);
			// 激活动作
			action.play();

		},

		/**
		 * @param {object} action 实例动作对象
		 * @param {number} weight 权重
		 * @description 设置动画的权重(weight)并将时间比例(timeScale)初始化为1
		 */
		//这个函数是必需的，因为animationAction.crossFadeTo()会禁用它的开始动作并设置开始动作的时间刻度到((开始动画的持续时间)/(结束动画的持续时间))
		//动作的影响程度 (取值范围[0, 1]). 0 (无影响)到1（完全影响）
		setWeight(action, weight) {
			// 动画将从当前时间（time）继续
			action.enabled = true
			// 设置时间比例（timeScale）以及停用所有的变形
			action.setEffectiveTimeScale(1);
			// 设置权重（weight）以及停止所有淡入淡出
			// 如果启用属性（enabled）为true, 那么有效权重也会被设为该值; 否则有效权重 (直接影响当前动画)将会被设为0.
			action.setEffectiveWeight(weight);
		},

		/**
		 * @description 准备淡入淡出
		 * @param {object} startAction 开始动作
		 * @param {object} endAction 结束动作
		 * @param {number} duration 持续时间
		 */
		prepareCrossFade(startAction, endAction, duration) {
			// 如果当前动作是'idle' 或者 不存在开始、结束动作，立即执行渐隐;
			// 否则等待当前动作完成循环后再执行淡入淡出操作
			if (currentBaseAction === 'idle' || !startAction || !endAction) {
				// 立即执行动作的淡入淡出
				this.executeCrossFade(startAction, endAction, duration)
			} else {
				// 等待当前动作完成循环后再执行淡入淡出操作
				this.synchronizeCrossFade(startAction, endAction, duration)
			}

			// 更新currentBaseAction当前动作
			if (endAction) {
				const clip = endAction.getClip()
				currentBaseAction = clip.name
			} else {
				currentBaseAction = 'None'
			}

			//根据currentBaseAction更新控件颜色
			crossFadeControls.forEach(function (control) {
				const name = control.property;
				if (name === currentBaseAction) {
					control.setActive();
				} else {
					control.setInactive();
				}
			});

		},
		/**
		 * @description 立即执行动作的淡入淡出
		 * @param {object} startAction 开始动作
		 * @param {object} endAction 结束动作
		 * @param {number} duration 持续时间
		 */
		executeCrossFade(startAction, endAction, duration) {
			//在消失之前，不仅开始动作，结束动作的权重也必须为1
			//(关于启动动作，这个地方已经保证了)
			console.log('startAction :>> ', startAction);
			if (endAction) {
				this.setWeight(endAction, 1)
				endAction.time = 0
				if (startAction) {
					// 在传入的时间段内, 让此动作(startAction)淡出（fade out），同时让另一个动作(endAction)淡入。
					startAction.crossFadeTo(endAction, duration, true)
				} else {
					// 淡入
					// 在传入的时间间隔内，逐渐将此动作的权重（weight）由0升到1
					endAction.fadeIn(duration);
				}
			} else {
				// 淡出
				// 在传入的时间间隔内，逐渐将此动作的权重（weight）由1降至0。
				startAction.fadeOut(duration);
			}
		},

		/**
		 * @description 等待当前动作完成循环后再执行淡入淡出操作
		 * @param {object} startAction 开始动作
		 * @param {object} endAction 结束动作
		 * @param {number} duration 持续时间
		 */
		synchronizeCrossFade(startAction, endAction, duration) {
			//监听模型(mixer）单次播放完成
			this.mixer.addEventListener('loop', onLoopFinished)
			let that = this
			function onLoopFinished(event) {
				// 监听当前动作，只有当 当前动作和开始动作相同时，才移除监听，并进行淡入淡出判断
				// 结束动作还未完成时将不能进入以下判断操作，将继续监听并执行结束动作
				if (event.action === startAction) {
					that.mixer.removeEventListener('loop', onLoopFinished);
					that.executeCrossFade(startAction, endAction, duration);
				}

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
			// 引擎自动更新渲染器
			requestAnimationFrame(this.animate);
			// 渲染循环
			for (let i = 0; i !== numAnimations; ++i) {
				const action = allActions[i];
				const clip = action.getClip();
				const settings = baseActions[clip.name] || additiveActions[clip.name];
				settings.weight = action.getEffectiveWeight();
			}
			const delta = this.clock.getDelta();
			// mixer 动画更新
			if (this.mixer) {
				this.mixer.update(delta);
			}
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

.control-inactive button {
	color: #888;
}
</style>
