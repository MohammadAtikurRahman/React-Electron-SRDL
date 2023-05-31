import React from "react";
import Button from "@material-ui/core/Button";

class Online extends React.Component {
  state = {
    online: navigator.onLine
  }

  componentDidMount() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  }

  updateOnlineStatus = () => {
    this.setState({ online: navigator.onLine });
  }

  render() {
    const { online } = this.state;

    return online ? (
      <Button
        className="button_style"
        variant="contained"
        size="small"
        style={{ color: "green"}}
      >
        Online
      </Button>
    ) : (
      <Button
        className="button_style"
        variant="contained"
        size="small"
        style={{ color: "red"}}
      >
        Offline
      </Button>
    );
  }
}

export default Online;
