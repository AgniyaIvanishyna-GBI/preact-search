import { Component, h } from 'preact';
import queryString from 'query-string';
import axios from 'axios';
import jsonp from 'simple-jsonp-promise';

//move to some .env
const customerId = 'presales';
const collection = 'wbPreFilter';
const area = 'Wbmason';

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

        const saytProducts = `https://${customerId}-cors.groupbycloud.com/api/v1/search?pretty`;
        const saytUrl = `https://${customerId}.groupbycloud.com/api/v1/sayt/search?collection=${collection}&area=${area}&productItems=3&searchItems=4&navigationItems=5&popularSearch=false&matchPrefix=false&query=${query}`;
        let args = {
            collection,
            area,
            fields: ["*", "id"],
            pageSize: 3,
            query: query,
            sort: {field: "_relevance"}
        };

        try{
            const res = await axios.post(saytProducts, args);
            let checkState = this.state;
            console.log('state', checkState);
            this.setState({result: {
              navigations: checkState.result.navigations ? checkState.result.navigations : null,
              products: res.data.records
            }});
        }catch(e){
            console.log(e);
        }

        try{
            const res2 = await jsonp(saytUrl);
            let checkState = this.state;
            console.log('state', checkState);
            this.setState({result: {
                navigations: res2.result,
                products: checkState.result.products ? checkState.result.products : null
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
        let saytHeadings = {
            "visualVariant.nonvisualVariant.categoryname": "CATEGORY",
            "visualVariant.nonvisualVariant.brandname": "BRAND"
        }

        return(
                <div class="suggested-terms">
                { navigations &&
                    navigations.searchTerms.map(item => {
                        return (
                            <div class="nav-item">
                              {item.value}
                            </div>
                        )
                   })
                }
                { navigations &&
                    navigations.navigations.map(item => {
                        return (
                            saytHeadings[item.name] ?
                              <div class="nav-item">
                                  <h2>{saytHeadings[item.name]}</h2>
                                  { item.values.map(elem => {
                                      return(
                                          <div>{elem}</div>
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
