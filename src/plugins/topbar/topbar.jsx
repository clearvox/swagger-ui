import React, {cloneElement} from "react"
import PropTypes from "prop-types"

//import "./topbar.less"
import Logo from "./clearvox_logo.png"

export default class Topbar extends React.Component {

    static propTypes = {
        layoutActions: PropTypes.object.isRequired
    }

    constructor(props, context) {
        super(props, context)
        this.state = {url: props.specSelectors.url(), selectedIndex: 0}
    }

    componentWillReceiveProps(nextProps) {
        this.setState({url: nextProps.specSelectors.url()})
    }

    onUrlChange = (e) => {
        let {target: {value}} = e;
        this.setState({url: value})
    };

    onHostChange = (e) => {
        let {target: {value}} = e
        this.setState({host: value})

        this.changeSwagger(value)
    };

    loadSpec = (url) => {
        this.props.specActions.updateUrl(url);
        this.props.specActions.download(url);
        this.changeSwagger(this.state.host);
    };

    onUrlSelect = (e) => {
        let url = e.target.value || e.target.href;
        this.loadSpec(url)
        this.setSelectedUrl(url);
        e.preventDefault()
    };

    downloadUrl = (e) => {
        this.loadSpec(this.state.url);
        e.preventDefault()
    };

    setSelectedUrl = (selectedUrl) => {
        const configs = this.props.getConfigs();
        const urls = configs.urls || [];

        if (urls && urls.length) {
            if (selectedUrl) {
                urls.forEach((spec, i) => {
                    if (spec.url === selectedUrl) {
                        this.setState({selectedIndex: i})
                    }
                })
            }
        }
    };

    componentWillMount() {
        const configs = this.props.getConfigs()
        const urls = configs.urls || []

        if (urls && urls.length) {
            let primaryName = configs["urls.primaryName"]
            if (primaryName) {
                urls.forEach((spec, i) => {
                    if (spec.name === primaryName) {
                        this.setState({selectedIndex: i})
                    }
                })
            }
        }
    }

    componentDidMount() {
        const urls = this.props.getConfigs().urls || []

        if (urls && urls.length) {
            this.loadSpec(urls[this.state.selectedIndex].url)
        }
    }

    onFilterChange = (e) => {
        let {target: {value}} = e;
        this.props.layoutActions.updateFilter(value)
    };

    changeSwagger(host) {
        // Try to get the Spec
        if (window.ui == null) {
            setTimeout(() => {
                this.changeSwagger(host);
            }, 100);
            return;
        }

        var newspec = window.ui.spec().toJSON().resolved;

        // If the spec has not been loaded yet, delay and try again
        if (newspec == null || this.props.specSelectors.loadingStatus() === "loading") {
            setTimeout(() => {
                this.changeSwagger(host);
            }, 100);
            return;
        }

        // We want the spec reflect our current server protocol/location/port
        // var scheme = 'https';
        //newspec.scheme = [scheme] || newspec.scheme;
        newspec.host = host;

        // If you need to change your path, do so here
        // newspec.basePath = newspec.basePath;

        // ui.getStore().dispatch({type: 'set_scheme', payload: {scheme: newspec.scheme[0]}})
        window.ui.getStore().dispatch({type: 'spec_update_resolved', payload: newspec});


        console.log(newspec.host);
    }

    render() {
        let {getComponent, specSelectors, getConfigs} = this.props;
        const Button = getComponent("Button")
        const Link = getComponent("Link")

        let isLoading = specSelectors.loadingStatus() === "loading"
        let isFailed = specSelectors.loadingStatus() === "failed"

        let inputStyle = {}
        if (isFailed) inputStyle.color = "red"
        if (isLoading) inputStyle.color = "#aaa"

        const {urls} = getConfigs()
        let control = []
        let formOnSubmit = function (e) {
            e.preventDefault()
        };

        if (urls) {
            let rows = []
            urls.forEach((link, i) => {
                rows.push(<option key={i} value={link.url}>{link.name}</option>)
            })

            control.push(
                <input className="download-url-input" placeholder="yourdomain.nl" type="text" onChange={this.onHostChange}
                       value={this.state.host} disabled={isLoading} style={inputStyle}/>)
            control.push(
                <label className="select-label" htmlFor="select">
                    <select id="select" disabled={isLoading} onChange={this.onUrlSelect}
                            value={urls[this.state.selectedIndex].url}>
                        {rows}
                    </select>
                </label>
            )
        }

        return (
            <div className="topbar">
                <div className="wrapper">
                    <div className="topbar-wrapper">
                        <Link href="#">
                            <img height="30" width="30" src={Logo} alt="Clearvox Nexxt API"/>
                            <span>Clearvox Nexxt API</span>
                        </Link>
                        <form className="download-url-wrapper" onSubmit={formOnSubmit}>
                            <label className="select-label" htmlFor="input"><span>Host</span></label>
                            {control.map((el, i) => cloneElement(el, {key: i}))}
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

Topbar.propTypes = {
    specSelectors: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    getConfigs: PropTypes.func.isRequired
};