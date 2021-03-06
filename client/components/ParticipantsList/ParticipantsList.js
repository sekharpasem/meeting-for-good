import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import autobind from 'autobind-decorator';
import ContentAdd from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import cssModules from 'react-css-modules';
import PropTypes from 'prop-types';

import nameInitials from '../../util/string.utils';
import styles from './participants-list.css';

class ParticipantsList extends Component {
  constructor(props) {
    super(props);
    const { event, curUser } = this.props;
    this.state = {
      event: (event !== undefined) ? event : null,
      curUser,
      openDeleteModal: false,
      openDrawer: false,
      guestToDelete: '',
      chipHoverEnable: '',
    };
  }

  componentWillMount() {
    const { curUser, event } = this.props;
    this.setState({ curUser, event });
  }

  componentWillReceiveProps(nextProps) {
    const { curUser, event } = nextProps;
    this.setState({ curUser, event });
  }

  @autobind
  handleCloseDeleteModal() {
    this.setState({ openDeleteModal: false });
  }

  @autobind
  handleOpenDeleteModal(id) {
    this.setState({ openDeleteModal: true, guestToDelete: id });
  }

  @autobind
  async handleDeleteGuest() {
    const { guestToDelete } = this.state;
    const nEvent = await this.props.cbDeleteGuest(guestToDelete);
    if (nEvent) {
      this.setState({ event: nEvent });
    } else {
      console.log('error at deleteEvent Modal');
    }
    this.handleCloseDeleteModal();
  }

  @autobind
  handleToggleShowInviteGuestDrawer() {
    this.props.showInviteGuests();
  }

  @autobind
  handleChipOnMouseOver(ev, guest) {
    this.props.cbOnChipMouseOver(guest);
  }

  renderChip(participant) {
    const { curUser, event } = this.state;
    const inLinestyles = {
      chip: {
        label: {
          flexGrow: 100,
        },
      },
    };
    let borderColor;
    let text;

    switch (participant.status) {
      case 1:
        borderColor = '3px solid #ff8080';
        text = 'Invited';
        break;
      case 2:
        borderColor = '3px solid #A0C2FF';
        text = 'Joined';
        break;
      case 3:
        borderColor = '0.5px solid #E0E0E0';
        text = 'Availability Submitted';
        break;
      default:
        break;
    }
    const onRequestDeleteEnable = () => {
      if (curUser._id !== participant.userId._id && event.owner === curUser._id) {
        return () => this.handleOpenDeleteModal(participant._id);
      }
      return null;
    };

    return (
      <Chip
        key={participant._id}
        styleName={(location.pathname === '/dashboard') ? 'chip' : 'chipHover'}
        labelStyle={inLinestyles.chip.label}
        onRequestDelete={onRequestDeleteEnable()}
        onMouseOver={ev => this.handleChipOnMouseOver(ev, participant.userId._id)}
        onMouseLeave={this.props.cbOnChipMouseLeave}
      >
        <Avatar
          src={participant.userId.avatar}
          styleName="avatar"
          style={{ border: borderColor }}
          alt={nameInitials(participant.userId.name)}
        />
        <div styleName="chipTextWrapper">
          <span styleName="chipTextName">{participant.userId.name}</span>
          <span>{text}</span>
        </div>
      </Chip>
    );
  }

  renderGuestList() {
    const { event } = this.state;
    const rows = [];
    event.participants.forEach((participant) => {
      const row = (
        <div key={participant._id}>
          {this.renderChip(participant)}
        </div>
      );
      rows.push(row);
    });
    return rows;
  }

  renderDeleteModal() {
    const { openDeleteModal } = this.state;
    const actions = [
      <FlatButton
        label="Cancel"
        primary
        onTouchTap={this.handleCloseDeleteModal}
      />,
      <FlatButton
        label="yes"
        secondary
        onTouchTap={this.handleDeleteGuest}
      />,
    ];
    const inLineStyles = {
      modal: {
        title: {
          backgroundColor: '#FF4025',
          color: '#ffffff',
          fontSize: '25px',
          height: '30px',
          paddingTop: 6,
        },
        content: {
          width: '22%',
          maxWidth: '22%',
          minWidth: '300px',
        },
        bodyStyle: {
          paddingTop: 10,
          fontSize: '25px',
        },
      },
    };

    return (
      <Dialog
        title="Delete Guest"
        titleStyle={inLineStyles.modal.title}
        contentStyle={inLineStyles.modal.content}
        bodyStyle={inLineStyles.modal.bodyStyle}
        actions={actions}
        modal
        open={openDeleteModal}
      >
        Are you sure you want to delete this guest?
      </Dialog>
    );
  }

  render() {
    const inLineStyles = {
      buttonAddGuest: {
        backgroundColor: '#e0e0e0',
        borderRadius: '50%',
        width: 40,
        height: 40,
        padding: 0,
        iconStyle: {
          borderRadius: '50%',
          width: 24,
          height: 24,
          color: '#FFF',
        },
        hoveredStyle: {
          backgroundColor: '#006400',
        },
      },
    };

    return (
      <div>
        <div styleName="headerContainer">
          <p styleName="particHeader">
            Participants
          </p>
          <IconButton
            style={inLineStyles.buttonAddGuest}
            iconStyle={inLineStyles.buttonAddGuest.iconStyle}
            onClick={this.handleToggleShowInviteGuestDrawer}
            hoveredStyle={inLineStyles.buttonAddGuest.hoveredStyle}
            tooltip="Add a participant"
            tooltipPosition="top-left"
          >
            <ContentAdd />
          </IconButton >
        </div>
        <div styleName="guestsContainer">
          {this.renderGuestList()}
        </div>
        {this.renderDeleteModal()}
      </div>

    );
  }
}

ParticipantsList.defaultProps = {
  cbOnChipMouseOver: () => { },
  cbOnChipMouseLeave: () => { },
};

ParticipantsList.propTypes = {
  // Current user
  curUser: PropTypes.shape({
    _id: PropTypes.string,      // Unique user id
    name: PropTypes.string,     // User name
    avatar: PropTypes.string,   // URL to image representing user(?)
  }).isRequired,

  showInviteGuests: PropTypes.func.isRequired,
  cbDeleteGuest: PropTypes.func.isRequired,
  cbOnChipMouseOver: PropTypes.func,
  cbOnChipMouseLeave: PropTypes.func,

  // Event containing list of event participants
  event: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    owner: PropTypes.string,
    active: PropTypes.bool,
    selectedTimeRange: PropTypes.array,
    dates: PropTypes.arrayOf(PropTypes.shape({
      fromDate: PropTypes.string,
      toDate: PropTypes.string,
      _id: PropTypes.string,
    })),
    participants: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.shape({
        id: PropTypes.string,
        avatar: PropTypes.string,
        name: PropTypes.string,
        emails: PropTypes.arrayOf(PropTypes.string),
      }),
      _id: PropTypes.string,
      status: PropTypes.oneOf([0, 1, 2, 3]),
      emailUpdate: PropTypes.bool,
      ownerNotified: PropTypes.bool,
      availability: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    })),
  }).isRequired,
};

export default cssModules(ParticipantsList, styles);
