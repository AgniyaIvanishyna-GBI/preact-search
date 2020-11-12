import { Component, h } from 'preact';
import queryString from 'query-string';
import axios from 'axios';

class Search extends Component{

    state = { 
        query: '',
        result: {}
    }

    
    getResults = async () => {
        //move to env ? 
        const collection = 'wbPreFilter';
        const area = 'Wbmason';
        const custumerId = 'presales';

        const { query } = this.state;
        
        const saytTermsUrl = `https://${custumerId}.groupbycloud.com/api/v1/sayt/search?`;
        let saytUrl = `${saytTermsUrl}&productItems=3&searchItems=4&navigationItems=5&matchPrefix=true&query=${query}`;
        let args = {
            "collection": collection,
            "area": area,
        };

        const res = await axios.get(saytUrl, { params: args });     

        this.setState({result: res.data.result});

    }

    handleInputChange = (e) => {
        this.setState({query: e.target.value });
        this.getResults();
    }

    renderNavigation = () => {
        const { result } = this.state;
        const { navigations, searchTerms} = result;
        let saytHeadings = {
            "visualVariant.nonvisualVariant.categoryname": "CATEGORY",
            "visualVariant.nonvisualVariant.brandname": "BRAND"
        }
        return(
                <div class="suggested-terms">
                {
                    searchTerms &&
                    <div class="nav-item">
                    { 
                        searchTerms.map(item => <div>{item.value}</div>)
                    }
                    </div>
                }
                { navigations && 
                    navigations.map(item => {
                        return (
                            <div class="nav-item">
                                <h2>{saytHeadings[item.name]}</h2>
                                { item.values.map(value => <div>{value.replace('&amp;', '&')}</div>)}
                            </div>
                        )
                   }) 
                }
            </div>
        )
    }

    renderProduct = () => {

    }

    renderResults = () => {
        const { result } = this.state;
        const { navigations, products, searchTerms} = result;

        let saytHeadings = {
            "visualVariant.nonvisualVariant.categoryname": "CATEGORY",
            "visualVariant.nonvisualVariant.brandname": "BRAND"
        }

        return (
            result && Object.keys(result).length  ?  
            <div class="sayt">
                    {this.renderNavigation()}
                    <div class="suggested-products">
                    {
                        products && 
                            products.map(item => {
                                return ( 
                                    <div class="product-card">
                                        <div>{item.allMeta.title}</div>
                                    </div>
                                )
                            })
                    }
                    </div>             
            </div> : null
        )
    }

    render(){
        const { query } = this.state;

        return (
            <div class="search-bar">
				<input
					type="text"
					value={query}
					id="search-input"
					placeholder="Search..."
					onInput={this.handleInputChange}
				/>
                {this.renderResults()}
            </div>
        )
    }

}

export default Search;