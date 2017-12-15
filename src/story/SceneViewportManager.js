/**
 * Scene viewport manager
 * @constructor FORGE.SceneViewportManager
 * @param {FORGE.Viewer} viewer {@link FORGE.Viewer} reference.
 * @param {FORGE.Scene} scene {@link FORGE.Scene} reference.
 * @extends {FORGE.BaseObject}
 */
FORGE.SceneViewportManager = function(viewer, scene)
{
    /**
     * The viewer reference.
     * @name FORGE.SceneViewport#_viewer
     * @type {FORGE.Viewer}
     * @private
     */
    this._viewer = viewer;

    /**
     * The scene reference.
     * @name FORGE.SceneViewport#_scene
     * @type {FORGE.Scene}
     * @private
     */
    this._scene = scene;

    /**
     * Array of scene viewports.
     * @name FORGE.Scene#_viewports
     * @type {Array<FORGE.SceneViewport>}
     * @private
     */
    this._viewports = null;

    /**
     * Array of scene viewports for VR rendering.
     * @name FORGE.Scene#_vrViewports
     * @type {Array<FORGE.SceneViewport>}
     * @private
     */
    this._vrViewports = null;

    /**
     * Index of active viewport, where the controller is active.
     * @name FORGE.Scene#_active
     * @type {number}
     * @private
     */
    this._active = 0;

    FORGE.BaseObject.call(this, "SceneViewport");

    this._boot();
};

FORGE.SceneViewportManager.prototype = Object.create(FORGE.BaseObject.prototype);
FORGE.SceneViewportManager.prototype.constructor = FORGE.SceneViewportManager;

/**
 * Boot sequence.
 * @private
 */
FORGE.SceneViewportManager.prototype._boot = function()
{
    // Parse config for screen rendering
    this._parseConfig(this._scene.config);

    // Prepare VR rendering
    this._setupVRViewports();

};

/**
 * Parse config.
 * @private
 */
FORGE.SceneViewportManager.prototype._parseConfig = function(config)
{
    this._viewports = [];
    this._vrViewports = [];

    if (typeof config.layout === "undefined" || config.layout.length === 0)
    {
        var layoutConfig = {};

        layoutConfig.background = this._scene.background;
        layoutConfig.viewport = new FORGE.Rectangle(0, 0, 100, 100);

        var sceneCameraConfig = /** @type {CameraConfig} */ (this._scene.config.camera);
        var storyCameraConfig = /** @type {CameraConfig} */ (this._viewer.mainConfig.camera);
        layoutConfig.camera = /** @type {CameraConfig} */ (FORGE.Utils.extendMultipleObjects(storyCameraConfig, sceneCameraConfig));

        var sceneViewConfig = /** @type {ViewConfig} */ (this._scene.config.view);
        var storyViewConfig = /** @type {ViewConfig} */ (this._viewer.mainConfig.view);
        layoutConfig.view = /** @type {ViewConfig} */ (FORGE.Utils.extendMultipleObjects(storyViewConfig, sceneViewConfig));

        layoutConfig.vr = false;

        // only on renderer with full viewport
        var viewport = new FORGE.SceneViewport(this._viewer, this._scene, layoutConfig);
        this._viewports.push(viewport);
    }
    else
    {
        for (var i=0,ii=config.layout.length; i<ii; i++)
        {
            var viewportConfig = config.layout[i];
            viewportConfig.vr = false;
            var viewport = new FORGE.SceneViewport(this._viewer, this._scene, viewportConfig);
            this._viewports.push(viewport);
        }        
    }
};

/**
 * Setup VR viewports.
 * @private
 */
FORGE.SceneViewportManager.prototype._setupVRViewports = function(config)
{
    var vrLeftConfig = {
        viewport: new FORGE.Rectangle(0, 0, 50, 100),
        backround: this._scene.background,
        camera: undefined,
        view: undefined,
        vr: true
    };

    var viewportL = new FORGE.SceneViewport(this._viewer, this._scene, vrLeftConfig);
    this._vrViewports.push(viewportL);

    var vrRightConfig = {
        viewport: new FORGE.Rectangle(50, 0, 50, 100),
        backround: this._scene.background,
        camera: undefined,
        view: undefined,
        vr: true
    };

    var viewportR = new FORGE.SceneViewport(this._viewer, this._scene, vrRightConfig);
    this._vrViewports.push(viewportR);
};

/**
 * Render routine.
 * @method FORGE.SceneViewportManager#render
 * @param {THREE.WebGLRenderer} webGLRenderer - WebGL renderer
 * @param {THREE.WebGLRenderTarget} target - target texture
 */
FORGE.SceneViewportManager.prototype.render = function(webGLRenderer, target)
{
    var viewports = this._viewer.renderer.vr === true ? this._vrViewports : this._viewports;
    viewports.forEach(function(viewport) {
        viewport.render(webGLRenderer, target);
    });
};

/**
 * Get the current active viewport.
 * @name FORGE.SceneViewportManager#activeViewport
 * @type {FORGE.SceneViewport}
 * @readonly
 */
Object.defineProperty(FORGE.SceneViewportManager.prototype, "activeViewport",
{
    /** @this {FORGE.SceneViewportManager} */
    get: function()
    {
        return this._viewports[this._active];
    }
});