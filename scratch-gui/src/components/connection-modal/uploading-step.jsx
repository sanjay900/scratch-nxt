import PropTypes from 'prop-types';
import React from 'react';

import Box from '../box/box.jsx';
import Dots from './dots.jsx';

import bluetoothIcon from './icons/bluetooth-white.svg';
import closeIcon from '../close-button/icon--close.svg';

import styles from './connection-modal.css';
import {SteeringConfig} from '../../containers/connection-modal.jsx';

class UploadingStep extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            driveType: SteeringConfig.FRONT_STEERING,
            firstPort: '2',
            secondPort: '3',
            thirdPort: '1',
            invert: false,
            validConfig: true
        };
        this.handleSetDriveType = this.handleSetDriveType.bind(this);
        this.handleSetFirstPort = this.handleSetFirstPort.bind(this);
        this.handleSetSecondPort = this.handleSetSecondPort.bind(this);
        this.handleSetThirdPort = this.handleSetThirdPort.bind(this);
        this.handleInvert = this.handleInvert.bind(this);
        this.handleConfigWrite = this.handleConfigWrite.bind(this);
    }

    checkPorts () {
        if (this.state.firstPort === this.state.secondPort ||
            this.state.firstPort === this.state.thirdPort ||
            this.state.secondPort === this.state.thirdPort) {
            return false;
        }
        if (this.state.secondPort === '4') {
            if (this.state.firstPort === '1' ||
                this.state.firstPort === '2' ||
                this.state.secondPort === '1' ||
                this.state.secondPort === '2') {
                return false;
            }
        }
        if (this.state.secondPort === '5') {
            if (this.state.firstPort === '1' ||
                this.state.firstPort === '3' ||
                this.state.secondPort === '1' ||
                this.state.secondPort === '3') {
                return false;
            }
        }
        if (this.state.secondPort === '6') {
            if (this.state.firstPort === '2' ||
                this.state.firstPort === '3' ||
                this.state.secondPort === '2' ||
                this.state.secondPort === '3') {
                return false;
            }
        }
        return true;
    }

    handleInvert (event) {
        this.setState({invert: event.target.checked});
    }

    handleSetDriveType (event) {
        this.setState({driveType: event.target.value, validConfig: this.checkPorts()});
    }

    handleSetFirstPort (event) {
        this.setState({firstPort: event.target.value, validConfig: this.checkPorts()});
    }

    handleSetSecondPort (event) {
        this.setState({secondPort: event.target.value, validConfig: this.checkPorts()});
    }

    handleSetThirdPort (event) {
        this.setState({thirdPort: event.target.value, validConfig: this.checkPorts()});
    }

    handleConfigWrite () {
        this.props.onSetDriveType(
            this.state.driveType,
            this.state.firstPort,
            this.state.secondPort,
            this.state.thirdPort,
            this.state.invert
        );
    }

    singlePortOptions () {
        return (
            <React.Fragment>
                <option value="1">{'A'}</option>
                <option value="2">{'B'}</option>
                <option value="3">{'C'}</option>
            </React.Fragment>
        );
    }

    multiPortOptions () {
        return (
            <React.Fragment>
                {this.singlePortOptions()}
                <option value="4">{'A and B'}</option>
                <option value="5">{'A and C'}</option>
                <option value="6">{'B and C'}</option>
            </React.Fragment>
        );
    }

    steeringOptions () {
        return (
            <React.Fragment>
                <label>
                    {'Steering Port: '}
                    <select
                        aria-label={'Steering Port'}
                        value={this.state.firstPort}
                        onChange={this.handleSetFirstPort}
                    >
                        {this.singlePortOptions()}
                    </select>
                </label>
                <label>
                    {'Driving Port(s): '}
                    <select
                        aria-label={'Driving Port(s)'}
                        value={this.state.secondPort}
                        onChange={this.handleSetSecondPort}
                    >
                        {this.multiPortOptions()}
                    </select>
                </label>
                {
                    this.state.secondPort < 4 &&
                    <label>
                        {'Other Port: '}
                        <select
                            aria-label={'Other Port'}
                            value={this.state.thirdPort}
                            onChange={this.handleSetThirdPort}
                        >
                            {this.singlePortOptions()}
                        </select>
                    </label>
                }
            </React.Fragment>
        );
    }

    tankOptions () {
        return (
            <React.Fragment>
                <label>
                    {'Left Port: '}
                    <select
                        aria-label={'Left Port'}
                        value={this.state.firstPort}
                        onChange={this.handleSetFirstPort}
                    >
                        {this.singlePortOptions()}
                    </select>
                </label>
                <label>
                    {'Right Port: '}
                    <select
                        aria-label={'Right Port'}
                        value={this.state.secondPort}
                        onChange={this.handleSetSecondPort}
                    >
                        {this.singlePortOptions()}
                    </select>
                </label>
                {
                    <label>
                        {'Other Port: '}
                        <select
                            aria-label={'Other Port'}
                            value={this.state.thirdPort}
                            onChange={this.handleSetThirdPort}
                        >
                            {this.singlePortOptions()}
                        </select>
                    </label>
                }
            </React.Fragment>
        );
    }

    render () {
        return (
            <Box className={styles.body}>
                <Box className={styles.activityArea}>
                    <Box className={styles.centeredRow}>
                        <div className={styles.peripheralActivity}>
                            <img
                                className={styles.peripheralActivityIcon}
                                src={this.props.peripheralImage}
                            />
                            <img
                                className={styles.bluetoothConnectingIcon}
                                src={bluetoothIcon}
                            />
                        </div>
                    </Box>
                </Box>
                <Box className={styles.bottomArea}>
                    <Box className={styles.instructionsLines}>
                        {`This extension is able to control different types of vehicles.
                Front steering describes a vehicle with a steering configuration similar to a car
                Tank steering describes a vehicle with separate left and right motors for steering.`}
                    </Box>
                    <label>
                        {'Steering Config: '}
                        <select
                            aria-label={'Steering Config'}
                            value={this.state.driveType}
                            onChange={this.handleSetDriveType}
                        >
                            {
                                Object.keys(SteeringConfig)
                                    .map(locale => (
                                        <option
                                            key={locale}
                                            value={SteeringConfig[locale]}
                                        >
                                            {
                                                locale.toLocaleLowerCase()
                                                    .split('_')
                                                    .map(s => s.charAt(0)
                                                        .toLocaleUpperCase() + s.slice(1))
                                                    .join(' ')
                                            }
                                        </option>
                                    ))
                            }
                        </select>
                    </label>
                    {this.state.driveType === SteeringConfig.FRONT_STEERING && this.steeringOptions()}
                    {this.state.driveType === SteeringConfig.TANK && this.tankOptions()}
                    <label>
                        {'Invert Driving Direction'}
                        <input
                            checked={this.state.invert}
                            name="invert"
                            type="checkbox"
                            onChange={this.handleInvert}
                        />
                    </label>
                    {!this.state.validConfig && 'The ports you have selected are conflicting. Please fix this.'}
                    <Dots
                        counter={2}
                        total={4}
                    />
                    <div className={styles.segmentedButton}>
                        <button
                            className={styles.connectionButton}
                            disabled={this.props.shouldUpload && this.state.validConfig}
                            onClick={this.handleConfigWrite}
                        >
                            {this.props.shouldUpload ? 'Uploading Control Program, please wait...' : 'Save Settings'}
                        </button>
                        <button
                            className={styles.connectionButton}
                            onClick={this.props.onDisconnect}
                        >
                            <img
                                className={styles.abortConnectingIcon}
                                src={closeIcon}
                            />
                        </button>
                    </div>
                </Box>
            </Box>
        );
    }
}

UploadingStep.propTypes = {
    onDisconnect: PropTypes.func,
    onSetDriveType: PropTypes.func,
    peripheralImage: PropTypes.string.isRequired,
    shouldUpload: PropTypes.bool.isRequired
};

export default UploadingStep;
