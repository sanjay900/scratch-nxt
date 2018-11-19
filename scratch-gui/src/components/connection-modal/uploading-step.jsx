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
            driveType: SteeringConfig.FRONT_STEERING
        };
        this.handleSetDriveType = this.handleSetDriveType.bind(this);
    }

    handleSetDriveType (event) {
        this.setState({driveType: event.target.value});
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
                Front steering describes a vehicle similar to a car, where there are two wheels that swivel to turn the vehicle. and two back wheels that drive.
                Tank steering describes a vehicle similar to a tank, with a left and right wheel.
                For front steering, port B is the steering motor, and port C is the drive motor.
                For tank steering, port B is the left motor, and port C is the right motor.`}
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
                    <Dots
                        counter={2}
                        total={4}
                    />
                    <div className={styles.segmentedButton}>
                        <button
                            className={styles.connectionButton}
                            disabled={this.props.shouldUpload}
                            onClick={() => this.props.onSetDriveType(this.state.driveType)}
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
