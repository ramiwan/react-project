import React, {Component} from 'react';
import _ from 'lodash'
import ProductTable from '../product-table/ProductTable'
import './main.css';

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = this.initState();
    }

    tableDelegates = {};
    timerId = null;
    timeout = 2000;

    componentDidMount() {
        this.startTimer()
    }

    componentWillUnmount() {
        clearTimeout(this.timerId)
    }

    initState = () => {
        const defaultData = {
            dataTables: {
                1: {
                    initialData: [],
                    isNewTable: false
                }
            },
            newId: 1
        };

        try {
            const data = JSON.parse(localStorage.getItem(`main`));

            if (data) {
                for (let key in data.dataTables) {
                    let nextData = JSON.parse(localStorage.getItem(`table_${key}`));

                    if (nextData) {
                        data.dataTables[key].initialData = nextData;
                    }
                }

                return data
            } else {
                localStorage.setItem(`main`, JSON.stringify(defaultData));

                return defaultData
            }
        } catch (e) {
            alert(Error `${e.name}\n${e.message}\n${e.stack}`);

            return defaultData
        }
    };

    tick = () => {
        const defaultData = {
            dataTables: {
                1: {
                    initialData: [],
                    isNewTable: false
                }
            },
            newId: 1
        };

        try {
            const data = JSON.parse(localStorage.getItem(`main`));

            if (data) {
                this.setState({
                    ...data
                });

                for (let key in data.dataTables) {
                    if (this.tableDelegates[key]) {
                        this.tableDelegates[key]()
                    }
                }
            } else {
                localStorage.setItem(`main`, JSON.stringify(defaultData));
            }
        } catch (e) {
            alert(Error `${e.name}\n${e.message}\n${e.stack}`);
        }

        this.timerId = setTimeout(this.tick, this.timeout);
    };

    startTimer = () => {
        this.tick()
    };

    addNewTable = (data) => {
        const dataTables = {...this.state.dataTables};
        let newId = this.state.newId;
        newId++;

        dataTables[newId] = {initialData: _.cloneDeep(data), isNewTable: true};
        this.setState({
            dataTables,
            newId
        });

        try {
            localStorage.setItem(`main`, JSON.stringify({newId, dataTables}));
        } catch (e) {
            alert(Error `${e.name}\n${e.message}\n${e.stack}`);
        }
    };

    saveNewTable = (tableId) => {
        const {newId} = this.state;
        const dataTables = {...this.state.dataTables};

        dataTables[tableId].initialData = [];
        dataTables[tableId].isNewTable = false;
        this.setState({
            dataTables
        });

        try {
            localStorage.setItem(`main`, JSON.stringify({newId, dataTables}));
        } catch (e) {
            alert(Error `${e.name}\n${e.message}\n${e.stack}`);
        }
    };

    render() {
        const {dataTables} = this.state;
        const mappedDataTables = [];

        for (let key in dataTables) {
            mappedDataTables.push(
                <ProductTable key={key}
                              className="main-wrapper__product-table"
                              tableId={+key}
                              data={dataTables[key].initialData}
                              isNewTable={dataTables[key].isNewTable}
                              addNewTable={this.addNewTable}
                              saveNewTable={this.saveNewTable}
                              refreshDataDelegate={(delegate) => {
                                  this.tableDelegates[key] = delegate
                              }}
                />
            );
        }

        return <div className="main-wrapper">
            <div className="main-wrapper__title-text">
                Products
            </div>
            {mappedDataTables}
        </div>
    }
}

export default Main
