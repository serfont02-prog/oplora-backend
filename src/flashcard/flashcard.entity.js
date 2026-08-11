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
exports.Flashcard = exports.NivelFlashcard = exports.TipoFlashcard = void 0;
var typeorm_1 = require("typeorm");
var articulo_entity_1 = require("../normativa/articulo.entity");
var tema_entity_1 = require("../tema/tema.entity");
var oposicion_entity_1 = require("../oposicion/oposicion.entity");
var usuario_entity_1 = require("../usuario/usuario.entity");
var repaso_fc_entity_1 = require("./repaso-fc.entity");
var TipoFlashcard;
(function (TipoFlashcard) {
    TipoFlashcard["VF"] = "vf";
    TipoFlashcard["HUECO"] = "hueco";
    TipoFlashcard["TRAMPA"] = "trampa";
    TipoFlashcard["ARTICULO"] = "articulo";
})(TipoFlashcard || (exports.TipoFlashcard = TipoFlashcard = {}));
var NivelFlashcard;
(function (NivelFlashcard) {
    NivelFlashcard["BASICO"] = "basico";
    NivelFlashcard["MEDIO"] = "medio";
    NivelFlashcard["ALTO"] = "alto";
})(NivelFlashcard || (exports.NivelFlashcard = NivelFlashcard = {}));
var Flashcard = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('flashcards')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _tipo_decorators;
    var _tipo_initializers = [];
    var _tipo_extraInitializers = [];
    var _nivel_decorators;
    var _nivel_initializers = [];
    var _nivel_extraInitializers = [];
    var _pregunta_decorators;
    var _pregunta_initializers = [];
    var _pregunta_extraInitializers = [];
    var _respuesta_decorators;
    var _respuesta_initializers = [];
    var _respuesta_extraInitializers = [];
    var _explicacion_decorators;
    var _explicacion_initializers = [];
    var _explicacion_extraInitializers = [];
    var _esParaDuelo_decorators;
    var _esParaDuelo_initializers = [];
    var _esParaDuelo_extraInitializers = [];
    var _activa_decorators;
    var _activa_initializers = [];
    var _activa_extraInitializers = [];
    var _creadaPor_decorators;
    var _creadaPor_initializers = [];
    var _creadaPor_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _articulo_decorators;
    var _articulo_initializers = [];
    var _articulo_extraInitializers = [];
    var _tema_decorators;
    var _tema_initializers = [];
    var _tema_extraInitializers = [];
    var _oposicion_decorators;
    var _oposicion_initializers = [];
    var _oposicion_extraInitializers = [];
    var _usuario_decorators;
    var _usuario_initializers = [];
    var _usuario_extraInitializers = [];
    var _repasos_decorators;
    var _repasos_initializers = [];
    var _repasos_extraInitializers = [];
    var Flashcard = _classThis = /** @class */ (function () {
        function Flashcard_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.tipo = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
            this.nivel = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _nivel_initializers, void 0));
            this.pregunta = (__runInitializers(this, _nivel_extraInitializers), __runInitializers(this, _pregunta_initializers, void 0));
            this.respuesta = (__runInitializers(this, _pregunta_extraInitializers), __runInitializers(this, _respuesta_initializers, void 0));
            this.explicacion = (__runInitializers(this, _respuesta_extraInitializers), __runInitializers(this, _explicacion_initializers, void 0));
            this.esParaDuelo = (__runInitializers(this, _explicacion_extraInitializers), __runInitializers(this, _esParaDuelo_initializers, void 0));
            this.activa = (__runInitializers(this, _esParaDuelo_extraInitializers), __runInitializers(this, _activa_initializers, void 0));
            this.creadaPor = (__runInitializers(this, _activa_extraInitializers), __runInitializers(this, _creadaPor_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _creadaPor_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.articulo = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _articulo_initializers, void 0));
            this.tema = (__runInitializers(this, _articulo_extraInitializers), __runInitializers(this, _tema_initializers, void 0));
            this.oposicion = (__runInitializers(this, _tema_extraInitializers), __runInitializers(this, _oposicion_initializers, void 0));
            this.usuario = (__runInitializers(this, _oposicion_extraInitializers), __runInitializers(this, _usuario_initializers, void 0));
            this.repasos = (__runInitializers(this, _usuario_extraInitializers), __runInitializers(this, _repasos_initializers, void 0));
            __runInitializers(this, _repasos_extraInitializers);
        }
        return Flashcard_1;
    }());
    __setFunctionName(_classThis, "Flashcard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _tipo_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: TipoFlashcard })];
        _nivel_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: NivelFlashcard, default: NivelFlashcard.BASICO })];
        _pregunta_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _respuesta_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _explicacion_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _esParaDuelo_decorators = [(0, typeorm_1.Column)({ default: false })];
        _activa_decorators = [(0, typeorm_1.Column)({ default: true })];
        _creadaPor_decorators = [(0, typeorm_1.Column)({ type: 'varchar', default: 'admin' })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _articulo_decorators = [(0, typeorm_1.ManyToOne)(function () { return articulo_entity_1.Articulo; }, { nullable: true })];
        _tema_decorators = [(0, typeorm_1.ManyToOne)(function () { return tema_entity_1.Tema; }, { nullable: true })];
        _oposicion_decorators = [(0, typeorm_1.ManyToOne)(function () { return oposicion_entity_1.Oposicion; }, { nullable: true })];
        _usuario_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; }, { nullable: true })];
        _repasos_decorators = [(0, typeorm_1.OneToMany)(function () { return repaso_fc_entity_1.RepasoFC; }, function (r) { return r.flashcard; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
        __esDecorate(null, null, _nivel_decorators, { kind: "field", name: "nivel", static: false, private: false, access: { has: function (obj) { return "nivel" in obj; }, get: function (obj) { return obj.nivel; }, set: function (obj, value) { obj.nivel = value; } }, metadata: _metadata }, _nivel_initializers, _nivel_extraInitializers);
        __esDecorate(null, null, _pregunta_decorators, { kind: "field", name: "pregunta", static: false, private: false, access: { has: function (obj) { return "pregunta" in obj; }, get: function (obj) { return obj.pregunta; }, set: function (obj, value) { obj.pregunta = value; } }, metadata: _metadata }, _pregunta_initializers, _pregunta_extraInitializers);
        __esDecorate(null, null, _respuesta_decorators, { kind: "field", name: "respuesta", static: false, private: false, access: { has: function (obj) { return "respuesta" in obj; }, get: function (obj) { return obj.respuesta; }, set: function (obj, value) { obj.respuesta = value; } }, metadata: _metadata }, _respuesta_initializers, _respuesta_extraInitializers);
        __esDecorate(null, null, _explicacion_decorators, { kind: "field", name: "explicacion", static: false, private: false, access: { has: function (obj) { return "explicacion" in obj; }, get: function (obj) { return obj.explicacion; }, set: function (obj, value) { obj.explicacion = value; } }, metadata: _metadata }, _explicacion_initializers, _explicacion_extraInitializers);
        __esDecorate(null, null, _esParaDuelo_decorators, { kind: "field", name: "esParaDuelo", static: false, private: false, access: { has: function (obj) { return "esParaDuelo" in obj; }, get: function (obj) { return obj.esParaDuelo; }, set: function (obj, value) { obj.esParaDuelo = value; } }, metadata: _metadata }, _esParaDuelo_initializers, _esParaDuelo_extraInitializers);
        __esDecorate(null, null, _activa_decorators, { kind: "field", name: "activa", static: false, private: false, access: { has: function (obj) { return "activa" in obj; }, get: function (obj) { return obj.activa; }, set: function (obj, value) { obj.activa = value; } }, metadata: _metadata }, _activa_initializers, _activa_extraInitializers);
        __esDecorate(null, null, _creadaPor_decorators, { kind: "field", name: "creadaPor", static: false, private: false, access: { has: function (obj) { return "creadaPor" in obj; }, get: function (obj) { return obj.creadaPor; }, set: function (obj, value) { obj.creadaPor = value; } }, metadata: _metadata }, _creadaPor_initializers, _creadaPor_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _articulo_decorators, { kind: "field", name: "articulo", static: false, private: false, access: { has: function (obj) { return "articulo" in obj; }, get: function (obj) { return obj.articulo; }, set: function (obj, value) { obj.articulo = value; } }, metadata: _metadata }, _articulo_initializers, _articulo_extraInitializers);
        __esDecorate(null, null, _tema_decorators, { kind: "field", name: "tema", static: false, private: false, access: { has: function (obj) { return "tema" in obj; }, get: function (obj) { return obj.tema; }, set: function (obj, value) { obj.tema = value; } }, metadata: _metadata }, _tema_initializers, _tema_extraInitializers);
        __esDecorate(null, null, _oposicion_decorators, { kind: "field", name: "oposicion", static: false, private: false, access: { has: function (obj) { return "oposicion" in obj; }, get: function (obj) { return obj.oposicion; }, set: function (obj, value) { obj.oposicion = value; } }, metadata: _metadata }, _oposicion_initializers, _oposicion_extraInitializers);
        __esDecorate(null, null, _usuario_decorators, { kind: "field", name: "usuario", static: false, private: false, access: { has: function (obj) { return "usuario" in obj; }, get: function (obj) { return obj.usuario; }, set: function (obj, value) { obj.usuario = value; } }, metadata: _metadata }, _usuario_initializers, _usuario_extraInitializers);
        __esDecorate(null, null, _repasos_decorators, { kind: "field", name: "repasos", static: false, private: false, access: { has: function (obj) { return "repasos" in obj; }, get: function (obj) { return obj.repasos; }, set: function (obj, value) { obj.repasos = value; } }, metadata: _metadata }, _repasos_initializers, _repasos_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Flashcard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Flashcard = _classThis;
}();
exports.Flashcard = Flashcard;
