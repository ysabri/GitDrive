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

var commit_pb = require('./commit_pb.js');
var branch_pb = require('./branch_pb.js');
goog.exportSymbol('proto.WorkSpace', null, global);

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
proto.WorkSpace = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.WorkSpace.repeatedFields_, null);
};
goog.inherits(proto.WorkSpace, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.WorkSpace.displayName = 'proto.WorkSpace';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.WorkSpace.repeatedFields_ = [2];



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
proto.WorkSpace.prototype.toObject = function(opt_includeInstance) {
  return proto.WorkSpace.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.WorkSpace} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.WorkSpace.toObject = function(includeInstance, msg) {
  var f, obj = {
    parent: (f = msg.getParent()) && branch_pb.Branch.toObject(includeInstance, f),
    commitsList: jspb.Message.toObjectList(msg.getCommitsList(),
    commit_pb.Commit.toObject, includeInstance),
    origincommit: jspb.Message.getFieldWithDefault(msg, 3, "")
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
 * @return {!proto.WorkSpace}
 */
proto.WorkSpace.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.WorkSpace;
  return proto.WorkSpace.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.WorkSpace} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.WorkSpace}
 */
proto.WorkSpace.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new branch_pb.Branch;
      reader.readMessage(value,branch_pb.Branch.deserializeBinaryFromReader);
      msg.setParent(value);
      break;
    case 2:
      var value = new commit_pb.Commit;
      reader.readMessage(value,commit_pb.Commit.deserializeBinaryFromReader);
      msg.addCommits(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
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
proto.WorkSpace.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.WorkSpace.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.WorkSpace} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.WorkSpace.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getParent();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      branch_pb.Branch.serializeBinaryToWriter
    );
  }
  f = message.getCommitsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      commit_pb.Commit.serializeBinaryToWriter
    );
  }
  f = message.getOrigincommit();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional Branch parent = 1;
 * @return {?proto.Branch}
 */
proto.WorkSpace.prototype.getParent = function() {
  return /** @type{?proto.Branch} */ (
    jspb.Message.getWrapperField(this, branch_pb.Branch, 1));
};


/** @param {?proto.Branch|undefined} value */
proto.WorkSpace.prototype.setParent = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.WorkSpace.prototype.clearParent = function() {
  this.setParent(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.WorkSpace.prototype.hasParent = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * repeated Commit commits = 2;
 * @return {!Array.<!proto.Commit>}
 */
proto.WorkSpace.prototype.getCommitsList = function() {
  return /** @type{!Array.<!proto.Commit>} */ (
    jspb.Message.getRepeatedWrapperField(this, commit_pb.Commit, 2));
};


/** @param {!Array.<!proto.Commit>} value */
proto.WorkSpace.prototype.setCommitsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.Commit=} opt_value
 * @param {number=} opt_index
 * @return {!proto.Commit}
 */
proto.WorkSpace.prototype.addCommits = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.Commit, opt_index);
};


proto.WorkSpace.prototype.clearCommitsList = function() {
  this.setCommitsList([]);
};


/**
 * optional string originCommit = 3;
 * @return {string}
 */
proto.WorkSpace.prototype.getOrigincommit = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.WorkSpace.prototype.setOrigincommit = function(value) {
  jspb.Message.setProto3StringField(this, 3, value);
};


goog.object.extend(exports, proto);
