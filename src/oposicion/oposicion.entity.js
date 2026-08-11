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
exports.Oposicion = exports.CategoriaEstadoEnum = exports.TipoAdministracionEnum = exports.TurnoEnum = exports.SubgrupoEnum = void 0;
var typeorm_1 = require("typeorm");
var convocatoria_entity_1 = require("../convocatoria/convocatoria.entity");
var oposicion_ley_entity_1 = require("../ley/oposicion-ley.entity");
var reto_entity_1 = require("../reto/reto.entity");
var usuario_oposicion_entity_1 = require("../usuario/usuario-oposicion.entity");
var SubgrupoEnum;
(function (SubgrupoEnum) {
    SubgrupoEnum["A1"] = "A1";
    SubgrupoEnum["A2"] = "A2";
    SubgrupoEnum["C1"] = "C1";
    SubgrupoEnum["C2"] = "C2";
})(SubgrupoEnum || (exports.SubgrupoEnum = SubgrupoEnum = {}));
var TurnoEnum;
(function (TurnoEnum) {
    TurnoEnum["LIBRE"] = "libre";
    TurnoEnum["PROMOCION_INTERNA"] = "promocion_interna";
})(TurnoEnum || (exports.TurnoEnum = TurnoEnum = {}));
/* 🔥 NUEVO */
var TipoAdministracionEnum;
(function (TipoAdministracionEnum) {
    TipoAdministracionEnum["ESTADO"] = "estado";
    TipoAdministracionEnum["CCAA"] = "ccaa";
    TipoAdministracionEnum["EMPRESA_PUBLICA"] = "empresa_publica";
})(TipoAdministracionEnum || (exports.TipoAdministracionEnum = TipoAdministracionEnum = {}));
/* 🔥 NUEVO */
var CategoriaEstadoEnum;
(function (CategoriaEstadoEnum) {
    CategoriaEstadoEnum["ADMINISTRACION_GENERAL"] = "administracion_general";
    CategoriaEstadoEnum["SEGURIDAD"] = "seguridad";
    CategoriaEstadoEnum["JUSTICIA"] = "justicia";
    CategoriaEstadoEnum["SANIDAD"] = "sanidad";
})(CategoriaEstadoEnum || (exports.CategoriaEstadoEnum = CategoriaEstadoEnum = {}));
var Oposicion = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('oposiciones')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _nombre_decorators;
    var _nombre_initializers = [];
    var _nombre_extraInitializers = [];
    var _cuerpo_decorators;
    var _cuerpo_initializers = [];
    var _cuerpo_extraInitializers = [];
    var _administracion_decorators;
    var _administracion_initializers = [];
    var _administracion_extraInitializers = [];
    var _ministerio_decorators;
    var _ministerio_initializers = [];
    var _ministerio_extraInitializers = [];
    var _activa_decorators;
    var _activa_initializers = [];
    var _activa_extraInitializers = [];
    var _tipoAdministracion_decorators;
    var _tipoAdministracion_initializers = [];
    var _tipoAdministracion_extraInitializers = [];
    var _categoria_decorators;
    var _categoria_initializers = [];
    var _categoria_extraInitializers = [];
    var _subgrupo_decorators;
    var _subgrupo_initializers = [];
    var _subgrupo_extraInitializers = [];
    var _turno_decorators;
    var _turno_initializers = [];
    var _turno_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _convocatorias_decorators;
    var _convocatorias_initializers = [];
    var _convocatorias_extraInitializers = [];
    var _retos_decorators;
    var _retos_initializers = [];
    var _retos_extraInitializers = [];
    var _oposicionLeyes_decorators;
    var _oposicionLeyes_initializers = [];
    var _oposicionLeyes_extraInitializers = [];
    var _usuarioOposiciones_decorators;
    var _usuarioOposiciones_initializers = [];
    var _usuarioOposiciones_extraInitializers = [];
    var Oposicion = _classThis = /** @class */ (function () {
        function Oposicion_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.nombre = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _nombre_initializers, void 0));
            this.cuerpo = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _cuerpo_initializers, void 0));
            this.administracion = (__runInitializers(this, _cuerpo_extraInitializers), __runInitializers(this, _administracion_initializers, void 0));
            this.ministerio = (__runInitializers(this, _administracion_extraInitializers), __runInitializers(this, _ministerio_initializers, void 0));
            this.activa = (__runInitializers(this, _ministerio_extraInitializers), __runInitializers(this, _activa_initializers, void 0));
            // 🔥 NUEVO → NIVEL ALTO
            this.tipoAdministracion = (__runInitializers(this, _activa_extraInitializers), __runInitializers(this, _tipoAdministracion_initializers, void 0));
            this.categoria = (__runInitializers(this, _tipoAdministracion_extraInitializers), __runInitializers(this, _categoria_initializers, void 0));
            this.subgrupo = (__runInitializers(this, _categoria_extraInitializers), __runInitializers(this, _subgrupo_initializers, void 0));
            this.turno = (__runInitializers(this, _subgrupo_extraInitializers), __runInitializers(this, _turno_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _turno_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.convocatorias = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _convocatorias_initializers, void 0));
            this.retos = (__runInitializers(this, _convocatorias_extraInitializers), __runInitializers(this, _retos_initializers, void 0));
            this.oposicionLeyes = (__runInitializers(this, _retos_extraInitializers), __runInitializers(this, _oposicionLeyes_initializers, void 0));
            this.usuarioOposiciones = (__runInitializers(this, _oposicionLeyes_extraInitializers), __runInitializers(this, _usuarioOposiciones_initializers, void 0));
            __runInitializers(this, _usuarioOposiciones_extraInitializers);
        }
        return Oposicion_1;
    }());
    __setFunctionName(_classThis, "Oposicion");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _nombre_decorators = [(0, typeorm_1.Column)()];
        _cuerpo_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _administracion_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _ministerio_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _activa_decorators = [(0, typeorm_1.Column)({ default: false })];
        _tipoAdministracion_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: TipoAdministracionEnum,
            })];
        _categoria_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: CategoriaEstadoEnum,
                nullable: false,
            })];
        _subgrupo_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: SubgrupoEnum,
                nullable: false,
            })];
        _turno_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: TurnoEnum,
                nullable: false,
                default: TurnoEnum.LIBRE,
            })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _convocatorias_decorators = [(0, typeorm_1.OneToMany)(function () { return convocatoria_entity_1.Convocatoria; }, function (c) { return c.oposicion; })];
        _retos_decorators = [(0, typeorm_1.OneToMany)(function () { return reto_entity_1.Reto; }, function (r) { return r.oposicion; })];
        _oposicionLeyes_decorators = [(0, typeorm_1.OneToMany)(function () { return oposicion_ley_entity_1.OposicionLey; }, function (ol) { return ol.oposicion; }, {
                cascade: true,
            })];
        _usuarioOposiciones_decorators = [(0, typeorm_1.OneToMany)(function () { return usuario_oposicion_entity_1.UsuarioOposicion; }, function (uo) { return uo.oposicion; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
        __esDecorate(null, null, _cuerpo_decorators, { kind: "field", name: "cuerpo", static: false, private: false, access: { has: function (obj) { return "cuerpo" in obj; }, get: function (obj) { return obj.cuerpo; }, set: function (obj, value) { obj.cuerpo = value; } }, metadata: _metadata }, _cuerpo_initializers, _cuerpo_extraInitializers);
        __esDecorate(null, null, _administracion_decorators, { kind: "field", name: "administracion", static: false, private: false, access: { has: function (obj) { return "administracion" in obj; }, get: function (obj) { return obj.administracion; }, set: function (obj, value) { obj.administracion = value; } }, metadata: _metadata }, _administracion_initializers, _administracion_extraInitializers);
        __esDecorate(null, null, _ministerio_decorators, { kind: "field", name: "ministerio", static: false, private: false, access: { has: function (obj) { return "ministerio" in obj; }, get: function (obj) { return obj.ministerio; }, set: function (obj, value) { obj.ministerio = value; } }, metadata: _metadata }, _ministerio_initializers, _ministerio_extraInitializers);
        __esDecorate(null, null, _activa_decorators, { kind: "field", name: "activa", static: false, private: false, access: { has: function (obj) { return "activa" in obj; }, get: function (obj) { return obj.activa; }, set: function (obj, value) { obj.activa = value; } }, metadata: _metadata }, _activa_initializers, _activa_extraInitializers);
        __esDecorate(null, null, _tipoAdministracion_decorators, { kind: "field", name: "tipoAdministracion", static: false, private: false, access: { has: function (obj) { return "tipoAdministracion" in obj; }, get: function (obj) { return obj.tipoAdministracion; }, set: function (obj, value) { obj.tipoAdministracion = value; } }, metadata: _metadata }, _tipoAdministracion_initializers, _tipoAdministracion_extraInitializers);
        __esDecorate(null, null, _categoria_decorators, { kind: "field", name: "categoria", static: false, private: false, access: { has: function (obj) { return "categoria" in obj; }, get: function (obj) { return obj.categoria; }, set: function (obj, value) { obj.categoria = value; } }, metadata: _metadata }, _categoria_initializers, _categoria_extraInitializers);
        __esDecorate(null, null, _subgrupo_decorators, { kind: "field", name: "subgrupo", static: false, private: false, access: { has: function (obj) { return "subgrupo" in obj; }, get: function (obj) { return obj.subgrupo; }, set: function (obj, value) { obj.subgrupo = value; } }, metadata: _metadata }, _subgrupo_initializers, _subgrupo_extraInitializers);
        __esDecorate(null, null, _turno_decorators, { kind: "field", name: "turno", static: false, private: false, access: { has: function (obj) { return "turno" in obj; }, get: function (obj) { return obj.turno; }, set: function (obj, value) { obj.turno = value; } }, metadata: _metadata }, _turno_initializers, _turno_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _convocatorias_decorators, { kind: "field", name: "convocatorias", static: false, private: false, access: { has: function (obj) { return "convocatorias" in obj; }, get: function (obj) { return obj.convocatorias; }, set: function (obj, value) { obj.convocatorias = value; } }, metadata: _metadata }, _convocatorias_initializers, _convocatorias_extraInitializers);
        __esDecorate(null, null, _retos_decorators, { kind: "field", name: "retos", static: false, private: false, access: { has: function (obj) { return "retos" in obj; }, get: function (obj) { return obj.retos; }, set: function (obj, value) { obj.retos = value; } }, metadata: _metadata }, _retos_initializers, _retos_extraInitializers);
        __esDecorate(null, null, _oposicionLeyes_decorators, { kind: "field", name: "oposicionLeyes", static: false, private: false, access: { has: function (obj) { return "oposicionLeyes" in obj; }, get: function (obj) { return obj.oposicionLeyes; }, set: function (obj, value) { obj.oposicionLeyes = value; } }, metadata: _metadata }, _oposicionLeyes_initializers, _oposicionLeyes_extraInitializers);
        __esDecorate(null, null, _usuarioOposiciones_decorators, { kind: "field", name: "usuarioOposiciones", static: false, private: false, access: { has: function (obj) { return "usuarioOposiciones" in obj; }, get: function (obj) { return obj.usuarioOposiciones; }, set: function (obj, value) { obj.usuarioOposiciones = value; } }, metadata: _metadata }, _usuarioOposiciones_initializers, _usuarioOposiciones_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Oposicion = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Oposicion = _classThis;
}();
exports.Oposicion = Oposicion;
