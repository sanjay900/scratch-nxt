const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const BT = require('../../io/bt');
const Base64Util = require('../../util/base64-util');
const MathUtil = require('../../util/math-util');
const log = require('../../util/log');
const PROGRAM = require('./program');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNDBweCIgaGVpZ2h0PSI0MHB4IiB2aWV3Qm94PSIwIDAgNDAgNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUwLjIgKDU1MDQ3KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5ldjMtYmxvY2staWNvbjwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJldjMtYmxvY2staWNvbiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9ImV2MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNS41MDAwMDAsIDMuNTAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS1wYXRoIiBzdHJva2U9IiM3Qzg3QTUiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgeD0iMC41IiB5PSIzLjU5IiB3aWR0aD0iMjgiIGhlaWdodD0iMjUuODEiIHJ4PSIxIj48L3JlY3Q+CiAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtcGF0aCIgc3Ryb2tlPSIjN0M4N0E1IiBmaWxsPSIjRTZFN0U4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHg9IjIuNSIgeT0iMC41IiB3aWR0aD0iMjQiIGhlaWdodD0iMzIiIHJ4PSIxIj48L3JlY3Q+CiAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtcGF0aCIgc3Ryb2tlPSIjN0M4N0E1IiBmaWxsPSIjRkZGRkZGIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHg9IjIuNSIgeT0iMTQuNSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjEzIj48L3JlY3Q+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNC41LDEwLjUgTDE0LjUsMTQuNSIgaWQ9IlNoYXBlIiBzdHJva2U9IiM3Qzg3QTUiIGZpbGw9IiNFNkU3RTgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLXBhdGgiIGZpbGw9IiM0MTQ3NTciIHg9IjQuNSIgeT0iMi41IiB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIHJ4PSIxIj48L3JlY3Q+CiAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtcGF0aCIgZmlsbD0iIzdDODdBNSIgb3BhY2l0eT0iMC41IiB4PSIxMy41IiB5PSIyMC4xMyIgd2lkdGg9IjIiIGhlaWdodD0iMiIgcng9IjAuNSI+PC9yZWN0PgogICAgICAgICAgICA8cGF0aCBkPSJNOS4wNiwyMC4xMyBMMTAuNTYsMjAuMTMgQzEwLjgzNjE0MjQsMjAuMTMgMTEuMDYsMjAuMzUzODU3NiAxMS4wNiwyMC42MyBMMTEuMDYsMjEuNjMgQzExLjA2LDIxLjkwNjE0MjQgMTAuODM2MTQyNCwyMi4xMyAxMC41NiwyMi4xMyBMOS4wNiwyMi4xMyBDOC41MDc3MTUyNSwyMi4xMyA4LjA2LDIxLjY4MjI4NDcgOC4wNiwyMS4xMyBDOC4wNiwyMC41Nzc3MTUzIDguNTA3NzE1MjUsMjAuMTMgOS4wNiwyMC4xMyBaIiBpZD0iU2hhcGUiIGZpbGw9IiM3Qzg3QTUiIG9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTguOTEsMjAuMTMgTDIwLjQyLDIwLjEzIEMyMC42OTYxNDI0LDIwLjEzIDIwLjkyLDIwLjM1Mzg1NzYgMjAuOTIsMjAuNjMgTDIwLjkyLDIxLjYzIEMyMC45MiwyMS45MDYxNDI0IDIwLjY5NjE0MjQsMjIuMTMgMjAuNDIsMjIuMTMgTDE4LjkyLDIyLjEzIEMxOC4zNjc3MTUzLDIyLjEzIDE3LjkyLDIxLjY4MjI4NDcgMTcuOTIsMjEuMTMgQzE3LjkxOTk3MjYsMjAuNTgxNTk3IDE4LjM2MTYyNDUsMjAuMTM1NDg0IDE4LjkxLDIwLjEzIFoiIGlkPSJTaGFwZSIgZmlsbD0iIzdDODdBNSIgb3BhY2l0eT0iMC41IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxOS40MjAwMDAsIDIxLjEzMDAwMCkgcm90YXRlKC0xODAuMDAwMDAwKSB0cmFuc2xhdGUoLTE5LjQyMDAwMCwgLTIxLjEzMDAwMCkgIj48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik04LjIzLDE3LjUgTDUsMTcuNSBDNC43MjM4NTc2MywxNy41IDQuNSwxNy4yNzYxNDI0IDQuNSwxNyBMNC41LDE0LjUgTDEwLjUsMTQuNSBMOC42NSwxNy4yOCBDOC41NTQ2Njk2MSwxNy40MTc5MDgyIDguMzk3NjUwMDYsMTcuNTAwMTU2NiA4LjIzLDE3LjUgWiIgaWQ9IlNoYXBlIiBmaWxsPSIjN0M4N0E1IiBvcGFjaXR5PSIwLjUiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTE4LjE1LDE4Ljg1IEwxNy42NSwxOS4zNSBDMTcuNTUyMzQxNiwxOS40NDQwNzU2IDE3LjQ5ODAzMzksMTkuNTc0NDE0MiAxNy41LDE5LjcxIEwxNy41LDIwIEMxNy41LDIwLjI3NjE0MjQgMTcuMjc2MTQyNCwyMC41IDE3LDIwLjUgTDE2LjUsMjAuNSBDMTYuMjIzODU3NiwyMC41IDE2LDIwLjI3NjE0MjQgMTYsMjAgQzE2LDE5LjcyMzg1NzYgMTUuNzc2MTQyNCwxOS41IDE1LjUsMTkuNSBMMTMuNSwxOS41IEMxMy4yMjM4NTc2LDE5LjUgMTMsMTkuNzIzODU3NiAxMywyMCBDMTMsMjAuMjc2MTQyNCAxMi43NzYxNDI0LDIwLjUgMTIuNSwyMC41IEwxMiwyMC41IEMxMS43MjM4NTc2LDIwLjUgMTEuNSwyMC4yNzYxNDI0IDExLjUsMjAgTDExLjUsMTkuNzEgQzExLjUwMTk2NjEsMTkuNTc0NDE0MiAxMS40NDc2NTg0LDE5LjQ0NDA3NTYgMTEuMzUsMTkuMzUgTDEwLjg1LDE4Ljg1IEMxMC42NTgyMTY3LDE4LjY1MjE4NjMgMTAuNjU4MjE2NywxOC4zMzc4MTM3IDEwLjg1LDE4LjE0IEwxMi4zNiwxNi42NSBDMTIuNDUwMjgwMywxNi41NTI4NjE3IDEyLjU3NzM5NjEsMTYuNDk4MzgzNSAxMi43MSwxNi41IEwxNi4yOSwxNi41IEMxNi40MjI2MDM5LDE2LjQ5ODM4MzUgMTYuNTQ5NzE5NywxNi41NTI4NjE3IDE2LjY0LDE2LjY1IEwxOC4xNSwxOC4xNCBDMTguMzQxNzgzMywxOC4zMzc4MTM3IDE4LjM0MTc4MzMsMTguNjUyMTg2MyAxOC4xNSwxOC44NSBaIiBpZD0iU2hhcGUiIGZpbGw9IiM3Qzg3QTUiIG9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTAuODUsMjMuNDUgTDExLjM1LDIyLjk1IEMxMS40NDc2NTg0LDIyLjg1NTkyNDQgMTEuNTAxOTY2MSwyMi43MjU1ODU4IDExLjUsMjIuNTkgTDExLjUsMjIuMyBDMTEuNSwyMi4wMjM4NTc2IDExLjcyMzg1NzYsMjEuOCAxMiwyMS44IEwxMi41LDIxLjggQzEyLjc3NjE0MjQsMjEuOCAxMywyMi4wMjM4NTc2IDEzLDIyLjMgQzEzLDIyLjU3NjE0MjQgMTMuMjIzODU3NiwyMi44IDEzLjUsMjIuOCBMMTUuNSwyMi44IEMxNS43NzYxNDI0LDIyLjggMTYsMjIuNTc2MTQyNCAxNiwyMi4zIEMxNiwyMi4wMjM4NTc2IDE2LjIyMzg1NzYsMjEuOCAxNi41LDIxLjggTDE3LDIxLjggQzE3LjI3NjE0MjQsMjEuOCAxNy41LDIyLjAyMzg1NzYgMTcuNSwyMi4zIEwxNy41LDIyLjU5IEMxNy40OTgwMzM5LDIyLjcyNTU4NTggMTcuNTUyMzQxNiwyMi44NTU5MjQ0IDE3LjY1LDIyLjk1IEwxOC4xNSwyMy40NSBDMTguMzQwNTcxNCwyMy42NDQ0MjE4IDE4LjM0MDU3MTQsMjMuOTU1NTc4MiAxOC4xNSwyNC4xNSBMMTYuNjQsMjUuNjUgQzE2LjU0OTcxOTcsMjUuNzQ3MTM4MyAxNi40MjI2MDM5LDI1LjgwMTYxNjUgMTYuMjksMjUuOCBMMTIuNzEsMjUuOCBDMTIuNTc3Mzk2MSwyNS44MDE2MTY1IDEyLjQ1MDI4MDMsMjUuNzQ3MTM4MyAxMi4zNiwyNS42NSBMMTAuODUsMjQuMTUgQzEwLjY1OTQyODYsMjMuOTU1NTc4MiAxMC42NTk0Mjg2LDIzLjY0NDQyMTggMTAuODUsMjMuNDUgWiIgaWQ9IlNoYXBlIiBmaWxsPSIjN0M4N0E1IiBvcGFjaXR5PSIwLjUiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTIxLjUsMjcuNSBMMjYuNSwyNy41IEwyNi41LDMxLjUgQzI2LjUsMzIuMDUyMjg0NyAyNi4wNTIyODQ3LDMyLjUgMjUuNSwzMi41IEwyMS41LDMyLjUgTDIxLjUsMjcuNSBaIiBpZD0iU2hhcGUiIHN0cm9rZT0iI0NDNEMyMyIgZmlsbD0iI0YxNUEyOSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';

/**
 * Enum for Ev3 direct command types.
 * Found in the 'EV3 Communication Developer Kit', section 4, page 24, at
 * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits.
 * @readonly
 * @enum {number}
 */
const NxtResponse = {
    DIRECT_COMMAND_REPLY: 0x00,
    DIRECT_COMMAND_NO_REPLY: 0x80,
    DIRECT_REPLY: 0x02,
    SYSTEM_COMMAND_RESPONSE: 0x01,
    SYSTEM_COMMAND_NO_RESPONSE: 0x81
};

const NxtCommand = {
    OPEN_READ: 0x80,
    OPEN_WRITE: 0x81,
    READ: 0x82,
    WRITE: 0x83,
    CLOSE: 0x84,
    DELETE: 0x85,
    FIND_FIRST: 0x86,
    FIND_NEXT: 0x87,
    GET_FIRMWARE_VERSION: 0x88,
    OPEN_WRITE_LINEAR: 0x89,
    OPEN_READ_LINEAR: 0x8A,
    OPEN_WRITE_DATA: 0x8B,
    OPEN_APPEND_DATA: 0x8C,
    SET_BRICK_NAME: 0x98,
    GET_DEVICE_INFO: 0x9B,
    START_PROGRAM: 0x00,
    STOP_PROGRAM: 0x01,
    PLAY_SOUND_FILE: 0x02,
    PLAY_TONE: 0x03,
    SET_OUTPUT_STATE: 0x04,
    SET_INPUT_MODE: 0x05,
    GET_OUTPUT_STATE: 0x06,
    GET_INPUT_VALUES: 0x07,
    RESET_INPUT_SCALED_VALUE: 0x08,
    MESSAGE_WRITE: 0x09,
    RESET_MOTOR_POSITION: 0x0A,
    GET_BATTERY_LEVEL: 0x0B,
    STOP_SOUND_PLAYBACK: 0x0C,
    KEEP_ALIVE: 0x0D,
    LS_GET_STATUS: 0x0E,
    LS_WRITE: 0x0F,
    LS_READ: 0x10,
    GET_CURRENT_PROGRAM_NAME: 0x11,
    MESSAGE_READ: 0x13
};

const NxtSensor = {
    NO_SENSOR: 0x00,
    TOUCH: 0x01,
    TEMPERATURE: 0x02,
    REFLECTION: 0x03,
    ANGLE: 0x04,
    LIGHT_ACTIVE: 0x05,
    LIGHT_INACTIVE: 0x06,
    SOUND_DB: 0x07,
    SOUND_DBA: 0x08,
    CUSTOM: 0x09,
    LOW_SPEED: 0x0A,
    LOW_SPEED_9V: 0x0B,
    NUMBER_OF_SENSOR_TYPES: 0x0C
};

const SteeringConfig = {
    FRONT_STEERING: '0',
    TANK: '1'
};

const NxtSensorMode = {
    RAW: 0x00,
    BOOLEAN: 0x20
};

const FileUploadState = {
    CLOSED: 0x00,
    OPEN: 0x01
};

const SteeringType = ['TANK', 'FRONT_STEERING'];

class EV3 {

    constructor (runtime, extensionId) {
        /**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;
        this._runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));
        this._runtime.on('NXT_MOTOR_CONFIG', steeringConfig => (this.steeringConfig = steeringConfig));
        this.data = [];

        /**
         * The id of the extension this peripheral belongs to.
         */
        this._extensionId = extensionId;

        /**
         * A list of the names of the sensors connected in ports 1,2,3,4.
         * @type {string[]}
         * @private
         */
        this._sensorPorts = [];

        /**
         * A list of the names of the motors connected in ports A,B,C,D.
         * @type {string[]}
         * @private
         */
        this._motorPorts = [];

        /**
         * The state of all sensor values.
         * @type {string[]}
         * @private
         */
        this._sensors = [0, 0, 0, 0];

        /**
         * The polling interval, in milliseconds.
         * @type {number}
         * @private
         */
        this._pollingInterval = 150;

        /**
         * The polling interval ID.
         * @type {number}
         * @private
         */
        this._pollingIntervalID = null;

        /**
         * The counter keeping track of polling cycles.
         * @type {string[]}
         * @private
         */
        this._pollingCounter = 0;
        this.power = 0;
        this.tmpPower = 100;
        this.angle = 0;
        this.steeringConfig = SteeringConfig.FRONT_STEERING;

        /**
         * The Bluetooth socket connection for reading/writing peripheral data.
         * @type {BT}
         * @private
         */
        this._bt = null;
        this._runtime.registerPeripheralExtension(extensionId, this);

        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);
        this._pollValues = this._pollValues.bind(this);
        this.fileData = PROGRAM;
        this.state = FileUploadState.CLOSED;
        this.prog = this.writeAsciiZ('SteeringControl.rxe'.padEnd(19, '\0'));
        this.progSize = this.writeLong(PROGRAM.length);
        this.handle = 0;


    }

    get distance () {
        let value = this._sensors.distance > 100 ? 100 : this._sensors.distance;
        value = value < 0 ? 0 : value;
        value = Math.round(100 * value) / 100;

        return value;
    }

    get brightness () {
        return this._sensors[1];
    }

    get volume () {
        return this._sensors[0];
    }

    writeAsciiZ (message) {
        const data = [];
        for (let i = 0; i < message.length; i++) {
            data.push(message.charCodeAt(i));
        }
        data.push(0);
        return data;
    }

    writeLong (long) {
        return [long, long >> 8, long >> 16, long >> 24];
    }

    writeConfig () {
        let message = `B${this.steeringConfig}25`;
        if (this.steeringConfig === SteeringConfig.TANK) {
            message = `B${this.steeringConfig}23`;
        }
        this.send(Uint8Array.of(
            NxtResponse.DIRECT_COMMAND_NO_REPLY,
            NxtCommand.MESSAGE_WRITE,
            0,
            message.length + 1,
            ...this.writeAsciiZ(message)));
    }

    numberToNXT (number) {
        const start = number < 0 ? '-' : '0';
        number = Math.round(number);
        number = Math.abs(number);
        return start + Array(Math.max(3 - String(number).length + 1, 0))
            .join('0') + number;
    }

    isButtonPressed () {
        return this._sensors[2] === 1;
    }

    beep (freq, time) {
        return this.send(Uint8Array.of(
            NxtResponse.DIRECT_COMMAND_NO_REPLY,
            NxtCommand.PLAY_TONE,
            freq, freq >> 8,
            time, time >> 8
        ));
    }

    stopAll () {
        this.stopAllMotors();
        this.stopSound();
    }

    stopSound () {
        return this.send(Uint8Array.of(NxtResponse.DIRECT_COMMAND_NO_REPLY, NxtCommand.STOP_SOUND_PLAYBACK));
    }

    stopAllMotors () {
        this.power = 0;
    }


    /**
     * Called by the runtime when user wants to scan for an EV3 peripheral.
     */
    scan () {
        this._bt = new BT(this._runtime, this._extensionId, {
            majorDeviceClass: 8,
            minorDeviceClass: 1
        }, this._onConnect, this._onMessage);
    }

    /**
     * Called by the runtime when user wants to connect to a certain EV3 peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect (id) {
        this._bt.connectPeripheral(id);
    }

    /**
     * Called by the runtime when user wants to disconnect from the EV3 peripheral.
     */
    disconnect () {
        this._bt.disconnect();
        this._clearSensorsAndMotors();
        window.clearInterval(this._pollingIntervalID);
        this._pollingIntervalID = null;
    }

    /**
     * Called by the runtime to detect whether the EV3 peripheral is connected.
     * @return {boolean} - the connected state.
     */
    isConnected () {
        let connected = false;
        if (this._bt) {
            connected = this._bt.isConnected();
        }
        return connected;
    }

    /**
     * Send a message to the peripheral BT socket.
     * @param {Uint8Array} message - the message to send.
     * @return {Promise} - a promise result of the send operation.
     */
    send (message) {
        if (!this.isConnected()) return Promise.resolve();
        console.log('SENT', message);
        return this._bt.sendMessage({
            message: Base64Util.uint8ArrayToBase64(Uint8Array.of(message.length, message.length >> 8, ...message)),
            encoding: 'base64'
        });
    }

    _setInputMode (port, type, mode) {
        return this.send(Uint8Array.of(
            NxtResponse.DIRECT_COMMAND_NO_REPLY,
            NxtCommand.SET_INPUT_MODE,
            port,
            type,
            mode
        ));
    }

    _startProgram () {
        return this.send(Uint8Array.of(NxtResponse.DIRECT_COMMAND_REPLY, NxtCommand.START_PROGRAM, ...this.prog));
    }

    _uploadProgram () {
        if (this.state === FileUploadState.CLOSED) {
            this.state = FileUploadState.OPEN;
            return this.send(Uint8Array.of(
                NxtResponse.SYSTEM_COMMAND_RESPONSE,
                NxtCommand.OPEN_WRITE,
                ...this.prog,
                ...this.progSize
            ));
        }
        if (this.fileData.length === 0) {
            this.fileData = PROGRAM;
            this.state = FileUploadState.CLOSED;
            return this.send(Uint8Array.of(NxtResponse.SYSTEM_COMMAND_RESPONSE, NxtCommand.CLOSE, this.handle));
        }
        const chunkSize = Math.min(64, this.fileData.length);
        const ret = this.fileData.slice(0, chunkSize);
        this.fileData = this.fileData.slice(chunkSize, this.fileData.length);
        return this.send(Uint8Array.of(NxtResponse.SYSTEM_COMMAND_RESPONSE, NxtCommand.WRITE, this.handle, ...ret));
    }

    _getInputValues (port) {
        return this.send(Uint8Array.of(NxtResponse.DIRECT_COMMAND_REPLY, NxtCommand.GET_INPUT_VALUES, port));
    }

    _getOutputValues (port) {
        return this.send(Uint8Array.of(NxtResponse.DIRECT_COMMAND_REPLY, NxtCommand.GET_OUTPUT_STATE, port));
    }

    /**
     * Genrates direct commands that are sent to the EV3 as a single or compounded byte arrays.
     * See 'EV3 Communication Developer Kit', section 4, page 24 at
     * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits.
     *
     * Direct commands are one of two types:
     * DIRECT_COMMAND_NO_REPLY = a direct command where no reply is expected
     * DIRECT_COMMAND_REPLY = a direct command where a reply is expected, and the
     * number and length of returned values needs to be specified.
     *
     * The direct command byte array sent takes the following format:
     * Byte 0 - 1: Command size, Little Endian. Command size not including these 2 bytes
     * Byte 2 - 3: Message counter, Little Endian. Forth running counter
     * Byte 4:     Command type. Either DIRECT_COMMAND_REPLY or DIRECT_COMMAND_NO_REPLY
     * Byte 5 - 6: Reservation (allocation) of global and local variables using a compressed format
     *             (globals reserved in byte 5 and the 2 lsb of byte 6, locals reserved in the upper
     *             6 bits of byte 6) – see documentation for more details.
     * Byte 7 - n: Byte codes as a single command or compound commands (I.e. more commands composed
     *             as a small program)
     *
     * @param {number} type - the direct command type.
     * @param {string} byteCommands - a compound array of EV3 Opcode + arguments.
     * @param {number} allocation - the allocation of global and local vars needed for replies.
     * @return {array} - generated complete command byte array, with header and compounded commands.
     */
    generateCommand (type, byteCommands, allocation = 0) {

        // Header (Bytes 0 - 6)
        let command = [];
        command[2] = 0; // Message counter unused for now
        command[3] = 0; // Message counter unused for now
        command[4] = type;
        command[5] = allocation & 0xFF;
        command[6] = allocation >> 8 && 0xFF;

        // Bytecodes (Bytes 7 - n)
        command = command.concat(byteCommands);

        // Calculate command length minus first two header bytes
        const len = command.length - 2;
        command[0] = len & 0xFF;
        command[1] = len >> 8 && 0xFF;

        return command;
    }


    /**
     * When the EV3 peripheral connects, start polling for sensor and motor values.
     * @private
     */
    _onConnect () {
        this._startProgram();
    }

    /**
     * Poll the EV3 for sensor and motor input values, based on the list of
     * known connected sensors and motors. This is sent as many compound commands
     * in a direct command, with a reply expected.
     *
     * See 'EV3 Firmware Developer Kit', section 4.8, page 46, at
     * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits
     * for a list of polling/input device commands and their arguments.
     *
     * @private
     */
    _pollValues () {
        if (!this.isConnected()) {
            window.clearInterval(this._pollingIntervalID);
            return;
        }
        // For the command to send, either request device list or request sensor data
        // based on the polling counter value.  (i.e., reset the list of devices every
        // 20 counts).
        for (let i = 0; i < 3; i++) {
            this._getInputValues(i);
        }
        const powerMul = this.steeringConfig === SteeringConfig.FRONT_STEERING ? -1 : 1;
        const message = `A${this.numberToNXT(this.angle)}${this.numberToNXT(powerMul * this.power)}`;
        this.send(Uint8Array.of(
            NxtResponse.DIRECT_COMMAND_NO_REPLY,
            NxtCommand.MESSAGE_WRITE,
            0,
            message.length + 1,
            ...this.writeAsciiZ(message)));

        this._pollingCounter++;
    }

    /**
     * Message handler for incoming EV3 reply messages, either a list of connected
     * devices (sensors and motors) or the values of the connected sensors and motors.
     *
     * See 'EV3 Communication Developer Kit', section 4.1, page 24 at
     * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits
     * for more details on direct reply formats.
     *
     * The direct reply byte array sent takes the following format:
     * Byte 0 – 1: Reply size, Little Endian. Reply size not including these 2 bytes
     * Byte 2 – 3: Message counter, Little Endian. Equals the Direct Command
     * Byte 4:     Reply type. Either DIRECT_REPLY or DIRECT_REPLY_ERROR
     * Byte 5 - n: Resonse buffer. I.e. the content of the by the Command reserved global variables.
     *             I.e. if the command reserved 64 bytes, these bytes will be placed in the reply
     *             packet as the bytes 5 to 68.
     *
     * See 'EV3 Firmware Developer Kit', section 4.8, page 56 at
     * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits
     * for direct response buffer formats for various commands.
     *
     * @param {object} params - incoming message parameters
     * @private
     */
    _onMessage (params) {
        const message = params.message;
        const data = Base64Util.base64ToUint8Array(message);
        this.data.push(...Array.from(data));
        let len = this.data[0] | (this.data[1] << 8);
        while (this.data.length >= len + 2) {
            this.data.splice(0, 2);
            const packet = this.data.splice(0, len);
            console.log(packet);
            if (packet.shift() === NxtResponse.DIRECT_REPLY) {
                const type = packet.shift();
                switch (type) {
                case NxtCommand.START_PROGRAM:
                    if (packet.shift() === 0) {
                        this._runtime.emit('NXT_PROGRAM_EXISTS');
                        // TODO: make this something the user can change.
                        this._setInputMode(0, NxtSensor.SOUND_DBA, NxtSensorMode.RAW);
                        this._setInputMode(1, NxtSensor.REFLECTION, NxtSensorMode.RAW);
                        this._setInputMode(2, NxtSensor.TOUCH, NxtSensorMode.BOOLEAN);
                        this._pollingIntervalID = window.setInterval(this._pollValues, this._pollingInterval);
                    } else {
                        this._runtime.emit('NXT_PROGRAM_MISSING');
                        this._uploadProgram();
                    }
                    break;
                case NxtCommand.OPEN_WRITE:
                    if (packet.shift() === 0) {
                        this.handle = packet.shift();
                        this._uploadProgram();
                    }
                    break;
                case NxtCommand.WRITE:
                    if (packet.shift() === 0) {
                        this._uploadProgram();
                    }
                    break;
                case NxtCommand.CLOSE:
                    if (packet.shift() === 0) {
                        this._startProgram();
                    }
                    break;
                case NxtCommand.GET_INPUT_VALUES:
                    // Command success
                    if (packet.shift() === 0) {
                        const port = packet.shift();
                        this._sensors[port] = packet[8] | (packet[9] << 8);
                    }
                    break;
                }
                len = this.data[0] | (this.data[1] << 8);
            }
        }
    }

    /**
     * Clear all the senor port and motor names, and their values.
     * @private
     */
    _clearSensorsAndMotors () {
        this._sensorPorts = [];
        this._sensors = [];
    }

}

/**
 * Enum for motor port names.
 * Note: if changed, will break compatibility with previously saved projects.
 * @readonly
 * @enum {string}
 */
const Ev3MotorMenu = ['A', 'B', 'C'];

/**
 * Enum for sensor port names.
 * Note: if changed, will break compatibility with previously saved projects.
 * @readonly
 * @enum {string}
 */
const Ev3SensorMenu = ['1', '2', '3', '4'];

class Scratch3Ev3Blocks {

    /**
     * The ID of the extension.
     * @return {string} the id
     */
    static get EXTENSION_ID () {
        return 'nxt';
    }

    /**
     * Creates a new instance of the EV3 extension.
     * @param  {object} runtime VM runtime
     * @constructor
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new EV3 peripheral instance
        this._peripheral = new EV3(this.runtime, Scratch3Ev3Blocks.EXTENSION_ID);
    }

    /**
     * Define the EV3 extension.
     * @return {object} Extension description.
     */
    getInfo () {
        return {
            id: Scratch3Ev3Blocks.EXTENSION_ID,
            name: 'LEGO NXT',
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'stopAllMotors',
                    text: formatMessage({
                        id: 'nxt.stopAllMotors',
                        default: 'stop',
                        description: 'Stop'
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'motorTurnClockwise',
                    text: formatMessage({
                        id: 'nxt.motorTurnClockwise',
                        default: 'turn left',
                        description: 'Turn the robot left'
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'motorTurnCounterClockwise',
                    text: formatMessage({
                        id: 'nxt.motorTurnCounterClockwise',
                        default: 'turn right',
                        description: 'turn the robot right'
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'motorForwards',
                    text: formatMessage({
                        id: 'nxt.motorForwards',
                        default: 'drive forwards',
                        description: 'drive forwards'
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'motorBackwards',
                    text: formatMessage({
                        id: 'nxt.motorBackwards',
                        default: 'drive backwards',
                        description: 'drive backwards'
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'motorSetPower',
                    text: formatMessage({
                        id: 'nxt.motorSetPower',
                        default: 'set power to [POWER] %',
                        description: 'set the driving power to some value'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        POWER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },
                {
                    opcode: 'motorSetAngle',
                    text: formatMessage({
                        id: 'nxt.motorSetAngle',
                        default: 'set angle to [ANGLE] degrees',
                        description: 'set the driving angle to some value'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ANGLE: {
                            type: ArgumentType.ANGLE,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setMotorConfig',
                    text: formatMessage({
                        id: 'nxt.setMotorConfig',
                        default: 'set vehicle type to [TYPE]',
                        description: 'set the vehicle type to a specified type'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'steering',
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'whenButtonPressed',
                    text: formatMessage({
                        id: 'nxt.whenButtonPressed',
                        default: 'when bumper hit',
                        description: 'when the bumper is hit'
                    }),
                    blockType: BlockType.HAT
                },
                {
                    opcode: 'whenDistanceLessThan',
                    text: formatMessage({
                        id: 'nxt.whenDistanceLessThan',
                        default: 'when distance < [DISTANCE]',
                        description: 'when the value measured by the distance sensor is less than some value'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        DISTANCE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    }
                },
                {
                    opcode: 'whenBrightnessLessThan',
                    text: formatMessage({
                        id: 'nxt.whenBrightnessLessThan',
                        default: 'when brightness < [DISTANCE]',
                        description: 'when value measured by brightness sensor is less than some value'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        DISTANCE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'buttonPressed',
                    text: formatMessage({
                        id: 'nxt.buttonPressed',
                        default: 'bumper hit?',
                        description: 'Has the bumpter been hit?'
                    }),
                    blockType: BlockType.BOOLEAN
                },
                {
                    opcode: 'getBrightness',
                    text: formatMessage({
                        id: 'nxt.getBrightness',
                        default: 'brightness',
                        description: 'gets measured brightness'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getSound',
                    text: formatMessage({
                        id: 'nxt.getSound',
                        default: 'volume',
                        description: 'gets measured volume'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'beep',
                    text: formatMessage({
                        id: 'nxt.beepNote',
                        default: 'beep note [NOTE] for [TIME] secs',
                        description: 'play some note on EV3 for some time'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NOTE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 60
                        },
                        TIME: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.5
                        }
                    }
                }
            ],
            menus: {
                motorPorts: this._formatMenu(Ev3MotorMenu),
                sensorPorts: this._formatMenu(Ev3SensorMenu),
                steering: this._formatMenu(SteeringType)
            }
        };
    }

    motorForwards () {
        this._peripheral.power = Math.abs(this._peripheral.tmpPower);
        if (this._peripheral.steeringConfig === SteeringConfig.TANK) {
            this._peripheral.angle = 0;
        }
    }

    stopAllMotors () {
        this._peripheral.power = 0;
    }

    motorBackwards () {
        this._peripheral.power = -Math.abs(this._peripheral.tmpPower);
        if (this._peripheral.steeringConfig === SteeringConfig.TANK) {
            this._peripheral.angle = 0;
        }
    }

    setMotorConfig (args) {
        this._peripheral.steeringConfig = SteeringConfig[SteeringType[args.TYPE]];
        return this._peripheral.writeConfig();
    }

    motorTurnClockwise () {
        this._peripheral.angle = -45;
        if (this._peripheral.steeringConfig === SteeringConfig.TANK) {
            this._peripheral.power = this._peripheral.tmpPower;
        }
    }

    motorTurnCounterClockwise () {
        this._peripheral.angle = 45;
        if (this._peripheral.steeringConfig === SteeringConfig.TANK) {
            this._peripheral.power = this._peripheral.tmpPower;
        }
    }

    motorSetAngle (args) {
        this._peripheral.angle = MathUtil.clamp(Cast.toNumber(args.ANGLE), -90, 90);
    }

    motorSetPower (args) {
        this._peripheral.tmpPower = this._peripheral.power = MathUtil.clamp(Cast.toNumber(args.POWER), -100, 100);
    }

    getMotorPosition (args) {
        const port = Cast.toNumber(args.PORT);

        if (![0, 1, 2, 3].includes(port)) {
            return;
        }

        const motor = this._peripheral.motor(port);
        let position = 0;
        if (motor) {
            position = MathUtil.wrapClamp(motor.position, 0, 360);
        }

        return position;
    }

    whenButtonPressed () {
        return this._peripheral.isButtonPressed();
    }

    whenDistanceLessThan (args) {
        const distance = MathUtil.clamp(Cast.toNumber(args.DISTANCE), 0, 100);

        return this._peripheral.distance < distance;
    }

    whenBrightnessLessThan (args) {
        const brightness = MathUtil.clamp(Cast.toNumber(args.DISTANCE), 0, 100);

        return this._peripheral.brightness < brightness;
    }

    buttonPressed () {
        return this._peripheral.isButtonPressed();
    }

    getDistance () {
        return this._peripheral.distance;
    }

    getBrightness () {
        return this._peripheral.brightness;
    }

    getSound () {
        return this._peripheral.volume;
    }

    beep (args) {
        const note = MathUtil.clamp(Cast.toNumber(args.NOTE), 47, 99); // valid EV3 sounds
        let time = Cast.toNumber(args.TIME) * 1000;
        time = MathUtil.clamp(time, 0, 3000);

        if (time === 0) {
            return; // don't send a beep time of 0
        }

        return new Promise(resolve => {
            // https://en.wikipedia.org/wiki/MIDI_tuning_standard#Frequency_values
            const freq = Math.pow(2, ((note - 69 + 12) / 12)) * 440;
            this._peripheral.beep(freq, time);

            // Run for some time even when no piezo is connected.
            setTimeout(resolve, time);
        });
    }

    /**
     * Call a callback for each motor indexed by the provided motor ID.
     * @param {MotorID} motorID - the ID specifier.
     * @param {Function} callback - the function to call with the numeric motor index for each motor.
     * @private
     */
    // TODO: unnecessary, but could be useful if 'all motors' is added (see WeDo2 extension)
    _forEachMotor (motorID, callback) {
        let motors;
        switch (motorID) {
            case 0:
                motors = [0];
                break;
            case 1:
                motors = [1];
                break;
            case 2:
                motors = [2];
                break;
            case 3:
                motors = [3];
                break;
            default:
                log.warn(`Invalid motor ID: ${motorID}`);
                motors = [];
                break;
        }
        for (const index of motors) {
            callback(index);
        }
    }

    /**
     * Formats menus into a format suitable for block menus, and loading previously
     * saved projects:
     * [
     *   {
     *    text: label,
     *    value: index
     *   },
     *   {
     *    text: label,
     *    value: index
     *   },
     *   etc...
     * ]
     *
     * @param {array} menu - a menu to format.
     * @return {object} - a formatted menu as an object.
     * @private
     */
    _formatMenu (menu) {
        const m = [];
        for (let i = 0; i < menu.length; i++) {
            const obj = {};
            obj.text = menu[i];
            obj.value = i.toString();
            m.push(obj);
        }
        return m;
    }
}

module.exports = Scratch3Ev3Blocks;
