import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import ReactTable from 'react-table';
import _ from 'lodash'
import './product-table.css';

class ProductTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            editProducts: {},
            history: {
                pastChanges: [],
                futureChanges: []
            },
            nextNewId: this.props.data && this.props.data.length > 0 ?
                this.props.data[this.props.data.length - 1].id + 1 : 1,
            checkedItems: {}
        };

        if (props.refreshDataDelegate != null) props.refreshDataDelegate(this.refreshData)
    }

    refreshData = () => {
        const {tableId} = this.props;

        try {
            const data = JSON.parse(localStorage.getItem(`table_${tableId}`));

            if (data) {
                this.setState({
                    data
                });
            }
        } catch (e) {
            alert(Error `${e.name}\n${e.message}\n${e.stack}`);
        }
    };

    onClickDelete = (productId) => {
        const {tableId} = this.props;
        let data = [...this.state.data];
        const editProducts = {...this.state.editProducts};
        const history = _.cloneDeep(this.state.history);

        // Update history
        history.pastChanges.push({
            data: data.filter(item => !item.isNew),
        });
        delete editProducts[productId];
        data = data.filter(item => item.id !== productId)
        this.setState({
            history,
            data,
            editProducts,
        });

        try {
            localStorage.setItem(`table_${tableId}`, JSON.stringify(data));
        } catch (e) {
            alert(Error `${e.name}\n${e.message}\n${e.stack}`);
        }
    };

    onClickEdit = (productId) => {
        const data = [...this.state.data];
        const editProducts = {...this.state.editProducts};
        const currentDataRow = data.filter(item => item.id === productId)[0];

        editProducts[productId] = {
            name: currentDataRow.name,
            cost: currentDataRow.cost
        };

        this.setState({
            editProducts
        });
    };

    onClickSave = (productId) => {
        const {tableId} = this.props;
        const data = [...this.state.data];
        const editProducts = {...this.state.editProducts};
        const history = _.cloneDeep(this.state.history);

        // Update history
        history.pastChanges.push({
            data: data.filter(item => !item.isNew),
        });

        data.forEach((item, index) => {
            if (item.id === productId) {
                data[index] = {...data[index], ...editProducts[productId], isNew: false,}
            }
        });
        delete editProducts[productId];

        this.setState({
            data,
            editProducts,
            history
        });

        try {
            localStorage.setItem(`table_${tableId}`, JSON.stringify(data));
        } catch (e) {
            alert(Error `${e.name}\n${e.message}\n${e.stack}`);
        }
    };

    onClickCancel = (productId) => {
        const {tableId} = this.props;
        let data = [...this.state.data];
        const editProducts = {...this.state.editProducts};
        let isNew = false;

        data.forEach((item) => {
            if (item.id === productId) {
                isNew = item.isNew
            }
        });

        if (isNew) {
            data = data.filter(item => item.id !== productId)
        }
        delete editProducts[productId];

        this.setState({
            data,
            editProducts
        });

        try {
            localStorage.setItem(`table_${tableId}`, JSON.stringify(data));
        } catch (e) {
            alert(Error `${e.name}\n${e.message}\n${e.stack}`);
        }
    };

    onClickAddNewRow = () => {
        const {tableId} = this.props;
        const data = [...this.state.data];
        const editProducts = {...this.state.editProducts};
        let {nextNewId} = this.state;

        const newData = {
            id: nextNewId,
            name: '',
            cost: 0,
            isNew: true
        };

        data.push({...newData});
        editProducts[nextNewId] = {...newData};
        nextNewId++;

        this.setState({
            data,
            editProducts,
            nextNewId
        });

        try {
            localStorage.setItem(`table_${tableId}`, JSON.stringify(data));
        } catch (e) {
            alert(Error `${e.name}\n${e.message}\n${e.stack}`);
        }
    };

    onClickUndo = () => {
        const {tableId} = this.props;
        const data = _.cloneDeep(this.state.data);
        const history = _.cloneDeep(this.state.history);

        if (history.pastChanges.length === 0) {
            return
        }

        const pastChanges = history.pastChanges.pop();

        history.futureChanges.push({
            data: data.filter(item => !item.isNew),
        });

        if (pastChanges) {
            this.setState({
                history,
                data: pastChanges.data,
            });

            try {
                localStorage.setItem(`table_${tableId}`, JSON.stringify(pastChanges.data));
            } catch (e) {
                alert(Error `${e.name}\n${e.message}\n${e.stack}`);
            }
        }
    };

    onClickRedo = () => {
        const {tableId} = this.props;
        const data = _.cloneDeep(this.state.data);
        const history = JSON.parse(JSON.stringify(this.state.history));

        if (history.futureChanges.length === 0) {
            return
        }

        const futureChanges = history.futureChanges.pop();

        history.pastChanges.push({
            data: data.filter(item => !item.isNew),
        });

        if (futureChanges) {
            this.setState({
                history,
                data: futureChanges.data,
            });

            try {
                localStorage.setItem(`table_${tableId}`, JSON.stringify(futureChanges.data));
            } catch (e) {
                alert(Error `${e.name}\n${e.message}\n${e.stack}`);
            }
        }
    };

    onClickRebuildTable = () => {
        const {addNewTable} = this.props;
        const {data} = this.state;

        addNewTable(data.filter(item => !item.isNew));
    };

    onClickSaveTable = () => {
        const {saveNewTable, tableId} = this.props;
        const {checkedItems} = this.state;
        let data = _.cloneDeep(this.state.data);

        saveNewTable(tableId);
        data = data.filter(item => checkedItems[item.id]);

        this.setState({
            data
        });

        try {
            localStorage.setItem(`table_${tableId}`, JSON.stringify(data));
        } catch (e) {
            alert(Error `${e.name}\n${e.message}\n${e.stack}`);
        }
    };

    renderEditable = (cellInfo) => {
        const editProducts = {...this.state.editProducts};

        return <React.Fragment>
            {
                !editProducts[cellInfo.original.id]
                    ?
                    <div className="product-table__value">
                        {(cellInfo.column.id === 'cost' ? '$' : '') + cellInfo.value}
                    </div>
                    :
                    <input
                        value={editProducts[cellInfo.original.id][cellInfo.column.id]}
                        type="text"
                        className="product-table__input"
                        onChange={e => {
                            if (cellInfo.column.id === 'cost') {
                                if (!isNaN(+e.target.value) && +e.target.value >= 0) {
                                    editProducts[cellInfo.original.id]['cost'] = e.target.value === '' ? 0 : +e.target.value;
                                }
                            } else {
                                editProducts[cellInfo.original.id][cellInfo.column.id] = e.target.value;
                            }
                            this.setState({
                                editProducts
                            });
                        }}
                        onKeyPress={e => {
                            if (e.charCode === 13) {
                                this.onClickSave(cellInfo.original.id)
                            }
                        }}
                    />
            }
        </React.Fragment>
    };

    render() {
        const {data, editProducts, history} = this.state;
        const checkedItems = {...this.state.checkedItems};
        const {className, isNewTable} = this.props;

        const tableOptions = {
            data: data,
            pageSize: data && data.length && data.length > 3 ? data.length : 3,
            showPagination: false,
            className: 'product-table',
            sortable: false,
            noDataText: 'No products',
            columns: [{
                width: 33,
                Cell: props => <div className="product-table__checkbox">
                    <input type="checkbox"
                           checked={checkedItems[props.original.id] || false}
                           onChange={(e) => {
                               if (e.target.checked) {
                                   checkedItems[props.original.id] = e.target.checked;
                               } else {
                                   delete checkedItems[props.original.id]
                               }

                               this.setState({
                                   checkedItems
                               });
                           }}
                    />
                </div>
            }, {
                Header: 'Item',
                accessor: 'name',
                Cell: props => this.renderEditable(props)
            }, {
                Header: 'Cost per lb/kg',
                width: 120,
                accessor: 'cost',
                Cell: props => this.renderEditable(props)
            }, {
                width: 110,
                accessor: 'id',
                Cell: props => <div className="product-table__control-buttons">
                    <span className={classNames({
                        'product-table__delete-button': !editProducts[props.original.id],
                        'product-table__cancel-button': editProducts[props.original.id]
                    })}
                          onClick={() => !editProducts[props.original.id] ?
                              this.onClickDelete(props.value) : this.onClickCancel(props.value)}
                    >
                            {!editProducts[props.original.id] ? 'Delete' : 'Cancel'}
                        </span>
                    <span className={classNames({
                        'product-table__edit-button': !editProducts[props.original.id],
                        'product-table__save-button': editProducts[props.original.id]
                    })}
                          onClick={() => !editProducts[props.original.id] ?
                              this.onClickEdit(props.value) : this.onClickSave(props.value)}
                    >
                            {!editProducts[props.original.id] ? 'Edit' : 'Save'}
                        </span>

                </div>
            }]
        };

        if (isNewTable) {
            tableOptions.columns.splice(3, 1);
        } else {
            tableOptions.columns.splice(0, 1);
        }

        return <div className={classNames('product-table-wrapper', {[className]: className})}>
            <div className="product-table-wrapper__history-buttons">
                <span className={classNames('product-table-wrapper__undo-button', {
                    'product-table-wrapper__undo-button_disabled': history.pastChanges.length === 0
                })}
                      onClick={this.onClickUndo}>
                    ←Undo
                </span>
                <span className={classNames('product-table-wrapper__redo-button', {
                    'product-table-wrapper__redo-button_disabled': history.futureChanges.length === 0
                })}
                      onClick={this.onClickRedo}>
                    Redo→
                </span>
            </div>
            <ReactTable {...tableOptions}/>
            <div className="product-table-wrapper__control-buttons">
                {isNewTable ?
                    <span className="product-table-wrapper__save-table-button"
                          onClick={this.onClickSaveTable}>
                        Save table
                    </span>
                    :
                    <React.Fragment>
                        <span className="product-table-wrapper__add-new-row-button"
                              onClick={this.onClickAddNewRow}>
                        Add new row
                        </span>
                        <span className="product-table-wrapper__rebuild-table-button"
                              onClick={this.onClickRebuildTable}>
                            Rebuild table
                        </span>
                    </React.Fragment>
                }
            </div>
        </div>
    }
}

ProductTable.propTypes = {
    tableId: PropTypes.number,
    data: PropTypes.array,
    isNewTable: PropTypes.bool,
    addNewTable: PropTypes.func,
    saveNewTable: PropTypes.func,
};

ProductTable.defaultProps = {
    tableId: 1,
    data: [],
    isNewTable: false,
    addNewTable: () => {},
    saveNewTable: () => {},
};

export default ProductTable
