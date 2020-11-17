import Preact, { Component, Fragment, h } from 'preact';
import queryString from 'query-string';
import axios from 'axios';
import jsonp from 'simple-jsonp-promise';

//move to some .env
const customerId = 'presales';
const collection = 'wbPreFilter';
const area = 'Wbmason';

class Search extends Component{
    state = {
        query: '',
        result: {}
    }

    getResults = ({ isInput }) => {
        if(isInput){
            this.fetchNavigation();
        }
        
        this.fetchProducts();
    }

    fetchProducts = async() => {
        const { query } = this.state;
        const saytProducts = `https://${customerId}-cors.groupbycloud.com/api/v1/search?pretty`;
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
      
            this.setState({result: {
              navigations: checkState.result.navigations ? checkState.result.navigations : null,
              products: res.data.records
            }});
        }catch(e){
            console.log(e);
        }

    }

    fetchNavigation = async() => {
        const { query } = this.state;
        const saytUrl = `https://${customerId}.groupbycloud.com/api/v1/sayt/search?collection=${collection}&area=${area}&productItems=3&searchItems=4&navigationItems=5&popularSearch=false&matchPrefix=false&query=${query}`;
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
        const { value } =  e.target;

        if(e && (e.keyCode == 13 || e.keyCode == 27 || value.trim() == '')) {
            if(e.keyCode == 27 || value.trim() == '') {
                // close sayt:
                this.setState({ result: {} });
            }
            if(e.keyCode == 13) {
                // do search:
                window.location = '/search/?q=' + this.urlEncode(value) + '&sort=_relevance';
            }
        }else{
            this.setState({query: value });
            this.getResults({isInput: true});
        }
    }

    handleMouseoverNavigation = (e) =>{
        this.setState({query: e.target.innerText});
        this.getResults({isInput: false});
    }

    createCard = (item) => {
        const { visualVariant, title, id,} = item.allMeta;
        let notFoundImg = 'https://wkpb5p20.media.zestyio.com/image-not-found.jpg' ;
        let img = ( visualVariant && 
            visualVariant[0] && 
            visualVariant[0].nonvisualVariant && 
            visualVariant[0].nonvisualVariant[0] && 
            visualVariant[0].nonvisualVariant[0].itemimagelarge && 
            visualVariant[0].nonvisualVariant[0].itemimagelarge[0]) ? 
            visualVariant[0].nonvisualVariant[0].itemimagelarge[0] : notFoundImg;
        return (
            <div class="product-card">
                <img src={`${img}`} onerror="this.src='https://wkpb5p20.media.zestyio.com/image-not-found.jpg';" />
                <div class="product-card-content">
                    <div class="product-card-title">
                        <a href={`/details/${this.urlEncode(title).replace(/,/g, '')}/${id}/`}>{title}</a>
                    </div>
                </div>
                <div class="price-line">
                    <div>{visualVariant[0].nonvisualVariant[0].itemid}</div>
                    <div class="price">
                        <span class="price-amt">
                            {visualVariant[0].nonvisualVariant[0].sellPrice}
                        </span>
                        { visualVariant[0].nonvisualVariant[0].unitid && 
                            visualVariant[0].nonvisualVariant[0].unitid != '' && 
                            `/${visualVariant[0].nonvisualVariant[0].unitid}`
                        }
                    </div>
                </div>
                <img class="product-card-qty" src="https://qljxctsr.media.zestyio.com/wb-add-to-cart.png" />
            </div>
        )
    }

    urlEncode = (url) => {
        url = url.replace(/ /g, '+');
        url = url.replace(/\//g, 'SLASH');
        url = url.replace(/\./g, '~');
        return url;
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
                { navigations && navigations.searchTerms &&
                    navigations.searchTerms.map(item => <div onmouseover={this.handleMouseoverNavigation}>{item.value}</div>)
                }
                { navigations && navigations.navigations &&
                    navigations.navigations.map(item => {
                         return  saytHeadings[item.name] ? [
                            this.renderCategoryName(saytHeadings,item),
                            this.renderCategoryItem(item)
                         ] : null
                   })
                }
            </div>
        )
    }

    renderCategoryName = (saytHeadings, item) => {
        return <h2>{saytHeadings[item.name]}</h2>
    }

    renderCategoryItem = (item) => {
        return item.values.map(elem => <div onmouseover={this.handleMouseoverNavigation}>{elem}</div>);
    }

    renderResults = () => {
        const { result } = this.state;
        const { products} = result;

        return (
            result && Object.keys(result).length  ?
            <div class="sayt">
                    {this.renderNavigation()}
                    <div class="suggested-products list">
                    {
                        products &&
                            products.map(item => {
                                return this.createCard(item);
                            })
                    }
                    </div>
            </div> : null
        )
    }

    render(){
        return (
            <div class="search-bar">
				<input
					type="text"
					class="search-input"
					placeholder="Search W.B. Mason"
                    onkeyup={this.handleInputChange}
				/>
                <img src="https://qljxctsr.media.zestyio.com/search-button.jpg"></img>
                {this.renderResults()}
            </div>
        )
    }

}

export default Search;
