import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import css from 'css';
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
    document.getElementsByTagName('head')[0].append(document.createElement('style'));
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
  stripScripts(s) {
    var div = document.createElement('div');
    div.innerHTML = s;
    var scripts = div.getElementsByTagName('script');
    var i = scripts.length;
    while (i--) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }
    return div.innerHTML;
  }
  componentDidUpdate(){
      let obj , style, styles;
      obj = css.parse(this.state.dataJSON.data.style);
      obj.stylesheet.rules.forEach(rule=>{
        rule.selectors = rule.selectors.map(selector=>{
          return ".proto-HTML-card "+selector;
        })
      })
      style = css.stringify(obj);
      styles = document.getElementsByTagName('style');
      styles[styles.length-1].innerHTML = style;
  }
  renderCol7() {
    if (this.state.fetchingData ){
      return(<div>Loading</div>)
    } else {
      let html = this.stripScripts(this.state.dataJSON.data.html_string);
      return (
        <div className="protograph-col7-mode proto-HTML-card" dangerouslySetInnerHTML={{__html: html}}>
        </div>
      )
    }
  }
  renderCol4() {
    if (this.state.fetchingData ){
      return(<div>Loading</div>)
    } else {
      let html = this.stripScripts(this.state.dataJSON.data.html_string);

      return (
        <div className="protograph-col4-mode proto-HTML-card" dangerouslySetInnerHTML={{__html: html}}>
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
