/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var user_pb = require('./user_pb.js');
var workspace_pb = require('./workspace_pb.js');
var commit_pb = require('./commit_pb.js');
goog.exportSymbol('proto.TopicSpace', null, global);

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.TopicSpace = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.TopicSpace.repeatedFields_, null);
};
goog.inherits(proto.TopicSpace, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.TopicSpace.displayName = 'proto.TopicSpace';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.TopicSpace.repeatedFields_ = [2,3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.TopicSpace.prototype.toObject = function(opt_includeInstance) {
  return proto.TopicSpace.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.TopicSpace} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.TopicSpace.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, ""),
    usersList: jspb.Message.toObjectList(msg.getUsersList(),
    user_pb.User.toObject, includeInstance),
    workspacesList: jspb.Message.toObjectList(msg.getWorkspacesList(),
    workspace_pb.WorkSpace.toObject, includeInstance),
    firstcommit: (f = msg.getFirstcommit()) && commit_pb.Commit.toObject(includeInstance, f),
    origincommit: (f = msg.getOrigincommit()) && commit_pb.Commit.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.TopicSpace}
 */
proto.TopicSpace.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.TopicSpace;
  return proto.TopicSpace.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.TopicSpace} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.TopicSpace}
 */
proto.TopicSpace.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 2:
      var value = new user_pb.User;
      reader.readMessage(value,user_pb.User.deserializeBinaryFromReader);
      msg.addUsers(value);
      break;
    case 3:
      var value = new workspace_pb.WorkSpace;
      reader.readMessage(value,workspace_pb.WorkSpace.deserializeBinaryFromReader);
      msg.addWorkspaces(value);
      break;
    case 4:
      var value = new commit_pb.Commit;
      reader.readMessage(value,commit_pb.Commit.deserializeBinaryFromReader);
      msg.setFirstcommit(value);
      break;
    case 5:
      var value = new commit_pb.Commit;
      reader.readMessage(value,commit_pb.Commit.deserializeBinaryFromReader);
      msg.setOrigincommit(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.TopicSpace.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.TopicSpace.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.TopicSpace} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.TopicSpace.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getUsersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      user_pb.User.serializeBinaryToWriter
    );
  }
  f = message.getWorkspacesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      workspace_pb.WorkSpace.serializeBinaryToWriter
    );
  }
  f = message.getFirstcommit();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      commit_pb.Commit.serializeBinaryToWriter
    );
  }
  f = message.getOrigincommit();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      commit_pb.Commit.serializeBinaryToWriter
    );
  }
};


/**
 * optional string name = 1;
 * @return {string}
 */
proto.TopicSpace.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.TopicSpace.prototype.setName = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * repeated User users = 2;
 * @return {!Array.<!proto.User>}
 */
proto.TopicSpace.prototype.getUsersList = function() {
  return /** @type{!Array.<!proto.User>} */ (
    jspb.Message.getRepeatedWrapperField(this, user_pb.User, 2));
};


/** @param {!Array.<!proto.User>} value */
proto.TopicSpace.prototype.setUsersList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.User=} opt_value
 * @param {number=} opt_index
 * @return {!proto.User}
 */
proto.TopicSpace.prototype.addUsers = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.User, opt_index);
};


proto.TopicSpace.prototype.clearUsersList = function() {
  this.setUsersList([]);
};


/**
 * repeated WorkSpace workspaces = 3;
 * @return {!Array.<!proto.WorkSpace>}
 */
proto.TopicSpace.prototype.getWorkspacesList = function() {
  return /** @type{!Array.<!proto.WorkSpace>} */ (
    jspb.Message.getRepeatedWrapperField(this, workspace_pb.WorkSpace, 3));
};


/** @param {!Array.<!proto.WorkSpace>} value */
proto.TopicSpace.prototype.setWorkspacesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.WorkSpace=} opt_value
 * @param {number=} opt_index
 * @return {!proto.WorkSpace}
 */
proto.TopicSpace.prototype.addWorkspaces = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.WorkSpace, opt_index);
};


proto.TopicSpace.prototype.clearWorkspacesList = function() {
  this.setWorkspacesList([]);
};


/**
 * optional Commit firstCommit = 4;
 * @return {?proto.Commit}
 */
proto.TopicSpace.prototype.getFirstcommit = function() {
  return /** @type{?proto.Commit} */ (
    jspb.Message.getWrapperField(this, commit_pb.Commit, 4));
};


/** @param {?proto.Commit|undefined} value */
proto.TopicSpace.prototype.setFirstcommit = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


proto.TopicSpace.prototype.clearFirstcommit = function() {
  this.setFirstcommit(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.TopicSpace.prototype.hasFirstcommit = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional Commit originCommit = 5;
 * @return {?proto.Commit}
 */
proto.TopicSpace.prototype.getOrigincommit = function() {
  return /** @type{?proto.Commit} */ (
    jspb.Message.getWrapperField(this, commit_pb.Commit, 5));
};


/** @param {?proto.Commit|undefined} value */
proto.TopicSpace.prototype.setOrigincommit = function(value) {
  jspb.Message.setWrapperField(this, 5, value);
};


proto.TopicSpace.prototype.clearOrigincommit = function() {
  this.setOrigincommit(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.TopicSpace.prototype.hasOrigincommit = function() {
  return jspb.Message.getField(this, 5) != null;
};


goog.object.extend(exports, proto);
