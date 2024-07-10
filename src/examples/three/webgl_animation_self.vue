<template>
	<div>
		<div id="container"></div>
	</div>
</template>

<script>
import * as THREE from "three";
// 导入控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
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
		// window.addEventListener("resize", this.onWindowSize)
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
			// this.setCamera()
			// this.setRenderer()
			// this.setController()
			// this.addHelper()
			// this.setPMREMGenerator()
			// this.setLight()
			// this.setGltfLoader()
			// this.addStatus()
		},
		/**
		 * @description 创建场景
		 */
		setScene() {
            let width = 600;
            let height = 400;
			// 创建场景对象Scene
			this.scene = new THREE.Scene()
            // AxesHelper：辅助观察的坐标系
            const axesHelper = new THREE.AxesHelper(200);
            this.scene.add(axesHelper);
			// 设置场景背景
			this.scene.background = new THREE.Color(0x000000);
            //  实现一个网格模型
            const geometry = new THREE.SphereGeometry(100 ); 
            //0xff0000设置材质颜色为红色
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ff00,
                transparent:true,//开启透明
                opacity:0.9,//设置透明度
                shininess: 80,
            }); 
            // 网格模型
            // const mesh = new THREE.Mesh(geometry, material);
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
                    // 在XOZ平面上分布
                    mesh.position.set(i * 200, 0, j * 200);
                    this.scene.add(mesh); //网格模型添加到场景中  
                }
            }
            // 设置网格模型的位置
            // mesh.position.set(50,50,50)
            // 场景添加内容
            // this.scene.add(mesh); 
            // 添加一个点光源
            //点光源：两个参数分别表示光源颜色和光照强度
            // 参数1：0xffffff是纯白光,表示光源颜色
            // 参数2：1.0,表示光照强度，可以根据需要调整
            const pointLight = new THREE.PointLight(0xffffff, 1.0);
            pointLight.intensity = 50.0;//光照强度
            pointLight.decay = 0.5;//设置光源不随距离衰减
            //点光源位置
            pointLight.position.set(3000, 3000, 0);//点光源放在x轴上
            this.scene.add(pointLight); //点光源添加到场景中

            // 添加环境光:没有特定方向，整体改变场景的光照明暗
            const ambient = new THREE.AmbientLight(0xffffff,0.3);
            this.scene.add(ambient);
            // 平行光
            const directionalLight = new THREE.DirectionalLight(0xffe500, 1);
            // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
            directionalLight.position.set(1000, 1000, 300);
            // 方向光指向对象网格模型mesh，可以不设置，默认的位置是0,0,0
            // directionalLight.target = mesh;
            this.scene.add(directionalLight);
            // DirectionalLightHelper：可视化平行光
            const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5,0xff0000);
            this.scene.add(dirLightHelper);
            //添加一个摄像头视角
            var fov = 90; // 视场，以度为单位  
            var aspect = width /height; // 纵横比  
            var near = 60; // 近裁剪面  
            var far = 5000; // 远裁剪面  
            this.camera = new THREE.PerspectiveCamera(90, aspect, near, far);
            // 设置一个摄像头位置属性
            this.camera.position.set(3000, 1500, 3000); 
            // 设置一个摄像头观察属性
            this.camera.lookAt(1000,0,1000);
            // 添加渲染器
            this.renderer = new THREE.WebGLRenderer({
                // 锯齿属性
                antialias:true,
            });
            //添加渲染器的自身的属性（size）    
            this.renderer.setSize(width*2, height*2);
            // 设置渲染器的像素比避免出现图像模糊的问题
			this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setClearColor(0x000000, 1); //设置背景颜色
            //添加渲染器的内容 (场景和摄像头)
            this.renderer.render(this.scene, this.camera);
            //将渲染器添加到dom
            this.container.appendChild( this.renderer.domElement);
           // 设置相机控件轨道控制器OrbitControls
            this.controller = new OrbitControls(this.camera,  this.renderer.domElement);
            this.controller.enableDamping = true; //启用阻尼（惯性）
			this.controller.dampingFactor = 0.04; //阻尼惯性有多大
            this.controller.target.set(1000,50, 1000); //控制器的焦点
             // 创建一个性能监听器
            this.addStatus()
            // 添加动画
            this.animate();
            // this.renderRotateY(mesh);
            // 实例化一个gui对象
            const gui = new GUI();
            gui.add(ambient, 'intensity', 0, 2.0).name('环境光强度').step(0.1);
            gui.add(directionalLight, 'intensity', 0, 2.0).name('平行光强度');    
            // 平行光子菜单
            const dirFolder = gui.addFolder('平行光');
            dirFolder.close();//关闭菜单
            // 平行光强度
            dirFolder.add(directionalLight, 'intensity',0,2);
            const dirFolder2 = dirFolder.addFolder('位置');//子菜单的子菜单
            dirFolder2.close();//关闭菜单
            // 平行光位置
            dirFolder2.add(directionalLight.position, 'x',-400,400);
            dirFolder2.add(directionalLight.position, 'y',-400,400);
            dirFolder2.add(directionalLight.position, 'z',-400,400);
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
		 * @description 创建辅助坐标轴
		 */
		addHelper() {
			// 模拟相机视锥体的辅助对象
			let helper = new THREE.CameraHelper(this.camera);
			// this.scene.add(helper);

			//创建辅助坐标轴、轴辅助 （每一个轴的长度）
			let axisHelper = new THREE.AxesHelper(150);  // 红线是X轴，绿线是Y轴，蓝线是Z轴
			this.scene.add(axisHelper);

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
        // 自动旋转？
        renderRotateY(mesh){
            const spt = this.clock.getDelta()*1000;//毫秒
            console.log('两帧渲染时间间隔(毫秒)',spt);
            console.log('帧率FPS',1000/spt);
            this.renderer.render(this.scene, this.camera); //执行渲染操作
            mesh.rotateY(0.2);//每次绕y轴旋转0.01弧度
            requestAnimationFrame(this.renderRotateY(mesh));//请求再次执行渲染函数render，渲染下一帧
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
				// // 设置剪辑动画
				that.mixer.clipAction(gltf.animations[0]).play()
				// 执行动画
				that.animate();
			}, undefined, (err => {
				console.error(err)
			}))

		}
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
