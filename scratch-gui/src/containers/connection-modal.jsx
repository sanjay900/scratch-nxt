import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import ConnectionModalComponent, {PHASES} from '../components/connection-modal/connection-modal.jsx';
import VM from 'scratch-vm';
import analytics from '../lib/analytics';
import extensionData from '../lib/libraries/extensions/index.jsx';
import {connect} from 'react-redux';
import {closeConnectionModal} from '../reducers/modals';

export const SteeringConfig = {
    FRONT_STEERING: '0',
    TANK: '1'
};
class ConnectionModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleScanning',
            'handleConfig',
            'handleCancel',
            'handleConnected',
            'handleConnecting',
            'handleDisconnect',
            'handleError',
            'handleHelp',
            'handleSetDriveType'
        ]);
        this.state = {
            extension: extensionData.find(ext => ext.extensionId === props.extensionId),
            driveType: SteeringConfig.FRONT_STEERING,
            uploading: false,
            phase: props.vm.getPeripheralIsConnected(props.extensionId) ?
                PHASES.connected : PHASES.scanning
        };
    }

    componentDidMount () {
        this.props.vm.runtime.on('NXT_PROGRAM_EXISTS', () => this.uploadNXTProgram(false));
        this.props.vm.runtime.on('NXT_PROGRAM_MISSING', () => this.uploadNXTProgram(true));
        this.props.vm.on('PERIPHERAL_CONNECTED', this.handleConnected);
        this.props.vm.on('PERIPHERAL_REQUEST_ERROR', this.handleError);
    }

    componentWillUnmount () {
        this.props.vm.removeListener('PERIPHERAL_CONNECTED', this.handleConnected);
        this.props.vm.removeListener('PERIPHERAL_REQUEST_ERROR', this.handleError);
    }

    handleScanning () {
        this.setState({
            phase: PHASES.scanning
        });
    }

    handleConnecting (peripheralId) {
        this.props.vm.connectPeripheral(this.props.extensionId, peripheralId);
        this.setState({
            phase: PHASES.connecting
        });
        analytics.event({
            category: 'extensions',
            action: 'connecting',
            label: this.props.extensionId
        });
    }

    handleDisconnect () {
        try {
            this.props.vm.disconnectPeripheral(this.props.extensionId);
        } finally {
            this.props.onCancel();
        }
    }

    handleCancel () {
        try {
            // If we're not connected to a peripheral, close the websocket so we stop scanning.
            if (!this.props.vm.getPeripheralIsConnected(this.props.extensionId)) {
                this.props.vm.disconnectPeripheral(this.props.extensionId);
            }
        } finally {
            // Close the modal.
            this.props.onCancel();
        }
    }

    handleError () {
        // Assume errors that come in during scanning phase are the result of not
        // having scratch-link installed.
        if (this.state.phase === PHASES.scanning || this.state.phase === PHASES.unavailable) {
            this.setState({
                phase: PHASES.unavailable
            });
        } else {
            this.setState({
                phase: PHASES.error
            });
            analytics.event({
                category: 'extensions',
                action: 'connecting error',
                label: this.props.extensionId
            });
        }
    }

    uploadNXTProgram (shouldUpload) {
        this.setState({
            phase: PHASES.uploading,
            uploading: shouldUpload
        });
        analytics.event({
            category: 'extensions',
            action: 'uploading',
            label: this.props.extensionId
        });
    }

    handleSetDriveType (driveType, firstMotor, secondMotor, thirdMotor) {
        if (firstMotor === secondMotor || firstMotor === thirdMotor || secondMotor === thirdMotor) {
            alert('Invalid configuration, you can not have multiple outputs set to the same port.');
            return;
        }
        if (secondMotor === '4') {
            if (firstMotor === '1' || firstMotor === '2' || secondMotor === '1' || secondMotor === '2') {
                alert('Invalid configuration, you can not have multiple outputs set to the same port.');
                return;
            }
        }
        if (secondMotor === '5') {
            if (firstMotor === '1' || firstMotor === '3' || secondMotor === '1' || secondMotor === '3') {
                alert('Invalid configuration, you can not have multiple outputs set to the same port.');
                return;
            }
        }
        if (secondMotor === '6') {
            if (firstMotor === '2' || firstMotor === '3' || secondMotor === '2' || secondMotor === '3') {
                alert('Invalid configuration, you can not have multiple outputs set to the same port.');
                return;
            }
        }
        this.props.vm.runtime.emit('NXT_MOTOR_CONFIG', {driveType, firstMotor, secondMotor, thirdMotor});
        this.setState({
            phase: PHASES.connected
        });
    }


    handleConnected () {
        if (this.props.extensionId === 'nxt') {
            return;
        }
        this.setState({
            phase: PHASES.connected
        });
        analytics.event({
            category: 'extensions',
            action: 'connected',
            label: this.props.extensionId
        });
    }

    handleHelp () {
        window.open(this.state.extension.helpLink, '_blank');
        analytics.event({
            category: 'extensions',
            action: 'help',
            label: this.props.extensionId
        });
    }

    handleConfig () {
        return this.uploadNXTProgram(false);
    }

    render () {
        return (
            <ConnectionModalComponent
                connectingMessage={this.state.extension.connectingMessage}
                driveType={this.state.driveType}
                extensionId={this.props.extensionId}
                name={this.state.extension.name}
                peripheralButtonImage={this.state.extension.peripheralButtonImage}
                peripheralImage={this.state.extension.peripheralImage}
                phase={this.state.phase}
                shouldUpload={this.state.uploading}
                smallPeripheralImage={this.state.extension.smallPeripheralImage}
                title={this.props.extensionId}
                useAutoScan={this.state.extension.useAutoScan}
                vm={this.props.vm}
                onCancel={this.handleCancel}
                onConfig={this.handleConfig}
                onConnected={this.handleConnected}
                onConnecting={this.handleConnecting}
                onDisconnect={this.handleDisconnect}
                onHelp={this.handleHelp}
                onScanning={this.handleScanning}
                onSetDriveType={this.handleSetDriveType}
            />
        );
    }
}

ConnectionModal.propTypes = {
    extensionId: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    extensionId: state.scratchGui.connectionModal.extensionId
});

const mapDispatchToProps = dispatch => ({
    onCancel: () => {
        dispatch(closeConnectionModal());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConnectionModal);