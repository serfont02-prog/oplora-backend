"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Articulo = void 0;
var typeorm_1 = require("typeorm");
var capitulo_entity_1 = require("./capitulo.entity");
var seccion_entity_1 = require("./seccion.entity");
var titulo_entity_1 = require("./titulo.entity");
var typeorm_2 = require("typeorm");
var pregunta_test_entity_1 = require("../test/pregunta-test.entity");
var Articulo = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('articulos')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _orden_decorators;
    var _orden_initializers = [];
    var _orden_extraInitializers = [];
    var _numero_decorators;
    var _numero_initializers = [];
    var _numero_extraInitializers = [];
    var _titulo_decorators;
    var _titulo_initializers = [];
    var _titulo_extraInitializers = [];
    var _contenido_decorators;
    var _contenido_initializers = [];
    var _contenido_extraInitializers = [];
    var _vigente_decorators;
    var _vigente_initializers = [];
    var _vigente_extraInitializers = [];
    var _pesoExamen_decorators;
    var _pesoExamen_initializers = [];
    var _pesoExamen_extraInitializers = [];
    var _resumen_decorators;
    var _resumen_initializers = [];
    var _resumen_extraInitializers = [];
    var _esquema_decorators;
    var _esquema_initializers = [];
    var _esquema_extraInitializers = [];
    var _ejemplo_decorators;
    var _ejemplo_initializers = [];
    var _ejemplo_extraInitializers = [];
    var _capitulo_decorators;
    var _capitulo_initializers = [];
    var _capitulo_extraInitializers = [];
    var _seccion_decorators;
    var _seccion_initializers = [];
    var _seccion_extraInitializers = [];
    var _tituloRef_decorators;
    var _tituloRef_initializers = [];
    var _tituloRef_extraInitializers = [];
    var _preguntasTest_decorators;
    var _preguntasTest_initializers = [];
    var _preguntasTest_extraInitializers = [];
    var Articulo = _classThis = /** @class */ (function () {
        function Articulo_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.orden = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _orden_initializers, void 0));
            this.numero = (__runInitializers(this, _orden_extraInitializers), __runInitializers(this, _numero_initializers, void 0));
            this.titulo = (__runInitializers(this, _numero_extraInitializers), __runInitializers(this, _titulo_initializers, void 0));
            this.contenido = (__runInitializers(this, _titulo_extraInitializers), __runInitializers(this, _contenido_initializers, void 0));
            this.vigente = (__runInitializers(this, _contenido_extraInitializers), __runInitializers(this, _vigente_initializers, void 0));
            this.pesoExamen = (__runInitializers(this, _vigente_extraInitializers), __runInitializers(this, _pesoExamen_initializers, void 0));
            this.resumen = (__runInitializers(this, _pesoExamen_extraInitializers), __runInitializers(this, _resumen_initializers, void 0));
            this.esquema = (__runInitializers(this, _resumen_extraInitializers), __runInitializers(this, _esquema_initializers, void 0));
            this.ejemplo = (__runInitializers(this, _esquema_extraInitializers), __runInitializers(this, _ejemplo_initializers, void 0));
            this.capitulo = (__runInitializers(this, _ejemplo_extraInitializers), __runInitializers(this, _capitulo_initializers, void 0));
            this.seccion = (__runInitializers(this, _capitulo_extraInitializers), __runInitializers(this, _seccion_initializers, void 0));
            this.tituloRef = (__runInitializers(this, _seccion_extraInitializers), __runInitializers(this, _tituloRef_initializers, void 0));
            this.preguntasTest = (__runInitializers(this, _tituloRef_extraInitializers), __runInitializers(this, _preguntasTest_initializers, void 0));
            __runInitializers(this, _preguntasTest_extraInitializers);
        }
        return Articulo_1;
    }());
    __setFunctionName(_classThis, "Articulo");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _orden_decorators = [(0, typeorm_1.Column)()];
        _numero_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _titulo_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _contenido_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _vigente_decorators = [(0, typeorm_1.Column)({ default: true })];
        _pesoExamen_decorators = [(0, typeorm_1.Column)({ default: 1 })];
        _resumen_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _esquema_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _ejemplo_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _capitulo_decorators = [(0, typeorm_1.ManyToOne)(function () { return capitulo_entity_1.Capitulo; }, { nullable: true })];
        _seccion_decorators = [(0, typeorm_1.ManyToOne)(function () { return seccion_entity_1.Seccion; }, function (s) { return s.articulos; }, { nullable: true })];
        _tituloRef_decorators = [(0, typeorm_1.ManyToOne)(function () { return titulo_entity_1.Titulo; }, { nullable: true })];
        _preguntasTest_decorators = [(0, typeorm_2.ManyToMany)(function () { return pregunta_test_entity_1.PreguntaTest; }, function (p) { return p.articulos; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _orden_decorators, { kind: "field", name: "orden", static: false, private: false, access: { has: function (obj) { return "orden" in obj; }, get: function (obj) { return obj.orden; }, set: function (obj, value) { obj.orden = value; } }, metadata: _metadata }, _orden_initializers, _orden_extraInitializers);
        __esDecorate(null, null, _numero_decorators, { kind: "field", name: "numero", static: false, private: false, access: { has: function (obj) { return "numero" in obj; }, get: function (obj) { return obj.numero; }, set: function (obj, value) { obj.numero = value; } }, metadata: _metadata }, _numero_initializers, _numero_extraInitializers);
        __esDecorate(null, null, _titulo_decorators, { kind: "field", name: "titulo", static: false, private: false, access: { has: function (obj) { return "titulo" in obj; }, get: function (obj) { return obj.titulo; }, set: function (obj, value) { obj.titulo = value; } }, metadata: _metadata }, _titulo_initializers, _titulo_extraInitializers);
        __esDecorate(null, null, _contenido_decorators, { kind: "field", name: "contenido", static: false, private: false, access: { has: function (obj) { return "contenido" in obj; }, get: function (obj) { return obj.contenido; }, set: function (obj, value) { obj.contenido = value; } }, metadata: _metadata }, _contenido_initializers, _contenido_extraInitializers);
        __esDecorate(null, null, _vigente_decorators, { kind: "field", name: "vigente", static: false, private: false, access: { has: function (obj) { return "vigente" in obj; }, get: function (obj) { return obj.vigente; }, set: function (obj, value) { obj.vigente = value; } }, metadata: _metadata }, _vigente_initializers, _vigente_extraInitializers);
        __esDecorate(null, null, _pesoExamen_decorators, { kind: "field", name: "pesoExamen", static: false, private: false, access: { has: function (obj) { return "pesoExamen" in obj; }, get: function (obj) { return obj.pesoExamen; }, set: function (obj, value) { obj.pesoExamen = value; } }, metadata: _metadata }, _pesoExamen_initializers, _pesoExamen_extraInitializers);
        __esDecorate(null, null, _resumen_decorators, { kind: "field", name: "resumen", static: false, private: false, access: { has: function (obj) { return "resumen" in obj; }, get: function (obj) { return obj.resumen; }, set: function (obj, value) { obj.resumen = value; } }, metadata: _metadata }, _resumen_initializers, _resumen_extraInitializers);
        __esDecorate(null, null, _esquema_decorators, { kind: "field", name: "esquema", static: false, private: false, access: { has: function (obj) { return "esquema" in obj; }, get: function (obj) { return obj.esquema; }, set: function (obj, value) { obj.esquema = value; } }, metadata: _metadata }, _esquema_initializers, _esquema_extraInitializers);
        __esDecorate(null, null, _ejemplo_decorators, { kind: "field", name: "ejemplo", static: false, private: false, access: { has: function (obj) { return "ejemplo" in obj; }, get: function (obj) { return obj.ejemplo; }, set: function (obj, value) { obj.ejemplo = value; } }, metadata: _metadata }, _ejemplo_initializers, _ejemplo_extraInitializers);
        __esDecorate(null, null, _capitulo_decorators, { kind: "field", name: "capitulo", static: false, private: false, access: { has: function (obj) { return "capitulo" in obj; }, get: function (obj) { return obj.capitulo; }, set: function (obj, value) { obj.capitulo = value; } }, metadata: _metadata }, _capitulo_initializers, _capitulo_extraInitializers);
        __esDecorate(null, null, _seccion_decorators, { kind: "field", name: "seccion", static: false, private: false, access: { has: function (obj) { return "seccion" in obj; }, get: function (obj) { return obj.seccion; }, set: function (obj, value) { obj.seccion = value; } }, metadata: _metadata }, _seccion_initializers, _seccion_extraInitializers);
        __esDecorate(null, null, _tituloRef_decorators, { kind: "field", name: "tituloRef", static: false, private: false, access: { has: function (obj) { return "tituloRef" in obj; }, get: function (obj) { return obj.tituloRef; }, set: function (obj, value) { obj.tituloRef = value; } }, metadata: _metadata }, _tituloRef_initializers, _tituloRef_extraInitializers);
        __esDecorate(null, null, _preguntasTest_decorators, { kind: "field", name: "preguntasTest", static: false, private: false, access: { has: function (obj) { return "preguntasTest" in obj; }, get: function (obj) { return obj.preguntasTest; }, set: function (obj, value) { obj.preguntasTest = value; } }, metadata: _metadata }, _preguntasTest_initializers, _preguntasTest_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Articulo = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Articulo = _classThis;
}();
exports.Articulo = Articulo;
