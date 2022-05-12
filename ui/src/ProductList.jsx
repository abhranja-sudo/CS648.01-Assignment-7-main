import React from 'react';
import { Panel } from 'react-bootstrap';

import ProductTable from './ProductTable.jsx';
import ProductAdd from './ProductAdd.jsx';
import graphQLFetch from './graphQLFetch.js';

const productTableHeadings = ['Product Name', 'Price', 'Category', 'Image'];

/**
 * Entry Point of our Application. Renders the whole page from here.
 */
export default class ProductList extends React.Component {
  constructor() {
    super();
    this.state = { products: [], initialLoading: true, productCount: 0 };
    this.addProduct = this.addProduct.bind(this);
    this.deleteProduct = this.deleteProduct.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async getCount() {
    const query = `query {
              productCount
          }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ productCount: data.productCount });
    }
  }

  async loadData() {
    this.getCount();

    const query = `
            query {
                productList {
                    id
                    name
                    category
                    price
                    imageUrl
                }
            }
        `;
    const data = await graphQLFetch(query);

    if (data) {
      this.setState({ products: data.productList, initialLoading: false });
    }
  }

  async addProduct(product) {
    const query = `
            mutation addProduct($product: ProductInputs!) {
                addProduct(product: $product) {
                    id
                }
            }
        `;

    const data = await graphQLFetch(query, { product });
    if (data) {
      this.loadData();
    }
  }

  async deleteProduct(index) {
    const query = `mutation productDelete($id: Int!) {
      productDelete(id: $id)
    }`;
    const { products } = this.state;
    const { location: { pathname, search }, history } = this.props;
    const { id } = products[index];

    const data = await graphQLFetch(query, { id });
    if (data && data.productDelete) {
      this.setState((prevState) => {
        const newList = [...prevState.products];
        if (pathname === `/products/${id}`) {
          history.push({ pathname: '/products', search });
        }
        newList.splice(index, 1);
        this.loadData();
        return { products: newList };
      });
    } else {
      this.loadData();
    }
  }

  render() {
    const { products, initialLoading, productCount } = this.state;
    return (
      <React.Fragment>
        <div className="container">
          <div>{`Showing ${productCount} available products`}</div>
          <hr />
          <ProductTable
            headings={productTableHeadings}
            products={products}
            loading={initialLoading}
            deleteProduct={this.deleteProduct}
          />

          <hr />

          <Panel defaultExpanded className="panel-dark">
            <Panel.Heading>
              <Panel.Title toggle>Add a new Product</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>
              <ProductAdd addProduct={this.addProduct} />
            </Panel.Body>
          </Panel>
        </div>
      </React.Fragment>
    );
  }
}
