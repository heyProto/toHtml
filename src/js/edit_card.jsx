import React from 'react';
import { render } from 'react-dom';
import { all as axiosAll, get as axiosGet, spread as axiosSpread } from 'axios';
import Card from './card.jsx';
import JSONSchemaForm from '../../lib/js/react-jsonschema-form';

export default class editHTMLCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 1,
      dataJSON: {},
      mode: "col7",
      publishing: false,
      schemaJSON: undefined,
      fetchingData: true,
      uiSchemaJSON: {},
    }
    // this.refLinkSourcesURL = window.ref_link_sources_url
    this.toggleMode = this.toggleMode.bind(this);
    this.onSubmitHandler = this.onSubmitHandler.bind(this);
    this.getData = this.getData.bind(this);

    // this.formValidator = this.formValidator.bind(this);
  }

  exportData() {
    let getDataObj = {
      step: this.state.step,
      dataJSON: this.state.dataJSON,
      schemaJSON: this.state.schemaJSON,
    }
    getDataObj["name"] = this.state.dataJSON.data.html_string.substr(0,100); // Reduces the name to ensure the slug does not get too long
    return getDataObj;
  }

  componentDidMount() {
    // get sample json data based on type i.e string or object.

    if (this.state.fetchingData){
      axiosAll([
        axiosGet(this.props.dataURL),
        axiosGet(this.props.schemaURL),
        axiosGet(this.props.uiSchemaURL),
        axiosGet(this.props.siteConfigURL)
      ])
      .then(axiosSpread((card, schema, uiSchema, site_configs) => {
        let stateVars = {
          fetchingData: false,
          dataJSON: card.data,
          schemaJSON: schema.data,
          uiSchemaJSON: uiSchema.data,
          siteConfigs: site_configs.data
        }
        this.setState(stateVars);
      }));
    }
  }


  onChangeHandler({formData}) {
    switch (this.state.step) {
      case 1:
        this.setState((prevStep, prop) => {
          let dataJSON = prevStep.dataJSON;
          dataJSON.data = formData;
          return {
            dataJSON: dataJSON
          }
        })
        break;
    }
  }

  onSubmitHandler({formData}) {
    switch(this.state.step) {
      case 1:
        if (typeof this.props.onPublishCallback === "function") {
          this.setState({ publishing: true });
          let publishCallback = this.props.onPublishCallback();
          publishCallback.then((message) => {
            this.setState({ publishing: false });
          });
        }
    }
  }

  renderSEO() {
    let seo_blockquote = '<blockquote>' + this.state.dataJSON.data.text + '</blockquote>'
    return seo_blockquote;
  }

  renderSchemaJSON() {
    let schema;
    switch(this.state.step){
      case 1:
        return this.state.schemaJSON.properties.data;
        break;
    }
  }

  renderFormData() {
    switch(this.state.step) {
      case 1:
        return this.state.dataJSON.data;
        break;
    }
  }

  showLinkText() {
    switch(this.state.step) {
      case 1:
        return '';
        break;
      case 2:
        return '< Back';
        break;
    }
  }

  showButtonText() {
    switch(this.state.step) {
      case 1:
        return 'Next';
        break;
      case 2:
        return 'Publish';
        break;
    }
  }

  onPrevHandler() {
    let prev_step = --this.state.step;
    this.setState({
      step: prev_step
    });
  }

  getData() {
    return {
      dataJSON: this.state.dataJSON,
      title: title
    };
  }

  toggleMode(e) {
    let element = e.target.closest('a'),
      mode = element.getAttribute('data-mode');

    this.setState((prevState, props) => {
      let newMode;
      if (mode !== prevState.mode) {
        newMode = mode;
      } else {
        newMode = prevState.mode
      }

      return {
        mode: newMode
      }
    })
  }

  componentDidUpdate(){
    if($('textarea').length !== 0){
      if($('textarea[data-autoresize]').length === 0){
        $('textarea').attr("data-autoresize",'');
        $('textarea').attr("rows",function(){
          return this.innerHTML.split('\n').length;
        });
      }
      if($('textarea[data-autoresize]').length !== 0){
        $.each($('textarea[data-autoresize]'), function() {
          var offset = this.offsetHeight - this.clientHeight;
          console.log(offset);
          var resizeTextarea = function(el) {
              $(el).css('height', 'auto').css('height', el.scrollHeight + offset);
          };
          $(this).on('keyup input', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
      });
      }
    }
  }
  render() {
    if (this.state.fetchingData) {
      return(<div>Loading</div>)
    } else {
      return (
        <div className="proto-container">
          <div className="ui grid form-layout">
            <div className="row">
              <div className="four wide column proto-card-form protograph-scroll-form">
                <div>
                  <div className="section-title-text">Fill the form</div>
                  <div className="ui label proto-pull-right">
                    ToHTML
                  </div>
                </div>
                <JSONSchemaForm schema={this.renderSchemaJSON()}
                  onSubmit={((e) => this.onSubmitHandler(e))}
                  onChange={((e) => this.onChangeHandler(e))}
                  validate={this.formValidator}
                  uiSchema={this.state.uiSchemaJSON.data}
                  formData={this.renderFormData()}>
                  <br/>
                  <a id="protograph-prev-link" className={`${this.state.publishing ? 'protograph-disable' : ''}`} onClick={((e) => this.onPrevHandler(e))}>{this.showLinkText()} </a>
                  <button type="submit" className={`${this.state.publishing ? 'ui primary loading disabled button' : ''} default-button protograph-primary-button`}>{this.showButtonText()}</button>
                </JSONSchemaForm>
              </div>
              <div className="twelve wide column proto-card-preview proto-share-card-div">
                <div className="protograph-menu-container">
                  <div className="ui compact menu">
                    <a className={`item ${this.state.mode === 'col7' ? 'active' : ''}`}
                      data-mode='col7'
                      onClick={this.toggleMode}
                    >
                      col-7
                    </a>
                    <a className={`item ${this.state.mode === 'col4' ? 'active' : ''}`}
                      data-mode='col4'
                      onClick={this.toggleMode}
                    >
                      col-4
                    </a>
                  </div>
                </div>
                <div className="protograph-app-holder">
                  <Card
                    mode={this.state.mode}
                    dataJSON={this.state.dataJSON}
                    schemaJSON={this.state.schemaJSON}
                    siteConfigs={this.state.siteConfigs}

                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}
