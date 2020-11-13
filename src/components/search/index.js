import { Component, h } from 'preact';
import queryString from 'query-string';
import axios from 'axios';

//move to some .env 
const customerId = 'grocery';
const collection = 'groceryProducts';
const area = 'Staging';

// const collection = 'wbPreFilter';
// const area = 'Wbmason';
// const customerId = 'presales';

class Search extends Component{
    state = { 
        query: '',
        result: {}
    }
    
    getResults = async () => {
        const { query } = this.state;
        
        const saytTermsUrl = `https://${customerId}-cors.groupbycloud.com/api/v1/search?pretty`;
        let saytUrl = `${saytTermsUrl}&searchItems=4&navigationItems=5&matchPrefix=true&query=${query}`;
        let args = {
            collection, 
            area,
            fields: ["*", "id"],
            pageSize: 3,
            query: query,
            sort: {field: "_relevance"}
        };

        try{
            const res = await axios.post(saytTermsUrl, args); 

            this.setState({result: {
                navigations: res.data.availableNavigation, 
                products: res.data.records
            }});
        }catch(e){
            console.log(e);
        }

    }

    handleInputChange = (e) => {
        this.setState({query: e.target.value });
        this.getResults();
    }

    renderNavigation = () => {
        const { result } = this.state;
        const { navigations} = result;
        // let saytHeadings = {
        //     "visualVariant.nonvisualVariant.categoryname": "CATEGORY",
        //     "visualVariant.nonvisualVariant.brandname": "BRAND"
        // }

        let saytHeadings = {
            "gbi_categories.2": "AISLE",
            "gbi_categories.3": "SHELF",
            "brand": "BRAND"
        }
        return(
                <div class="suggested-terms">
                { navigations && 
                    navigations.map(item => {
                        return (
                            saytHeadings[item.name] ? 
                            <div class="nav-item">
                                <h2>{item.displayName}</h2>
                                { item.refinements.map(elem => {
                                    return( 
                                        <div>{elem.value.replace('&amp;', '&')}</div>
                                   )}
                                )}
                            </div> : null
                        )
                   }) 
                }
            </div>
        )
    }

    renderResults = () => {
        const { result } = this.state;
        const { products} = result;

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