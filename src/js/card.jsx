import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

export default class HTMLCard extends React.Component {
  constructor(props) {
    super(props)
    let stateVar = {
      fetchingData: true,
      dataJSON: {},
      optionalConfigJSON: {},
      content: undefined,
      editable: false,
      text: undefined
    };
    if (this.props.dataJSON) {
      stateVar.fetchingData = false;
      stateVar.dataJSON = this.props.dataJSON;
    }

    if(this.props.text){
      stateVar.text = this.props.text;
    }

    if (this.props.optionalConfigJSON) {
      stateVar.optionalConfigJSON = this.props.optionalConfigJSON;
    }

    if(this.props.editable){
      stateVar.editable=this.props.editable;
    }
    this.state = stateVar;
  }

  exportData() {
    return this.props.selector.getBoundingClientRect();
  }

  componentDidMount() {

    if (this.state.fetchingData) {
      let items_to_fetch = [
        axios.get(this.props.dataURL)
      ];

      if (this.props.siteConfigURL) {
        items_to_fetch.push(axios.get(this.props.siteConfigURL));
      }

      axios.all(items_to_fetch).then(axios.spread((card, site_configs) => {
        let stateVar = {
          fetchingData: false,
          dataJSON: card.data,
          siteConfigs: site_configs ? site_configs.data : this.state.siteConfigs
        };
        this.setState(stateVar);
      }));
    }else{
      this.componentDidUpdate();
    }
  }
  componentDidUpdate(){
      document.getElementsByTagName('head')[0].append(document.createElement('style'));
      let styles = document.getElementsByTagName('style');
      styles[styles.length-1].innerHTML = this.state.dataJSON.data.style;
  }
  renderCol7() {
    if (this.state.fetchingData ){
      return(<div>Loading</div>)
    } else {
      return (
        <div className="protograph-col7-mode proto-HTML-card" dangerouslySetInnerHTML={{__html: this.state.dataJSON.data.html_string}}>
        </div>
      )
    }
  }
  renderCol4() {
    if (this.state.fetchingData ){
      return(<div>Loading</div>)
    } else {
      return (
        <div className="protograph-col4-mode proto-HTML-card" dangerouslySetInnerHTML={{__html: this.state.dataJSON.data.html_string}}>
        </div>
      )
    }
  }

  render() {
    switch(this.props.mode) {
      case 'col7' :
        return this.renderCol7();
        break;
      case 'col4':
        return this.renderCol4();
        break;
    }
  }
}
