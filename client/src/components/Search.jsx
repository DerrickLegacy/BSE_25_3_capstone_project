import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Row,
  Form,
  FormGroup,
  Input,
  Button,
  Col,
} from 'reactstrap';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

function Search() {
  const dispatch = useDispatch();
  const searchData = useSelector((state) => state.searchData || []);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = (term) => {
    dispatch({ type: 'FETCH_SEARCH_DATA', payload: term });
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
    fetchData({ firstName: value === '' ? '*' : value });
  };

  const handleClear = () => {
    setSearchTerm('');
    fetchData({ firstName: '*' });
  };

  const handleSubmit = (e) => e.preventDefault();
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('first_name', { header: 'First Name' }),
    columnHelper.accessor('last_name', { header: 'Last Name' }),
  ];

  const table = useReactTable({
    data: searchData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Container className="my-4">
      <Row className="mb-3 top10">
        <div className="">
          <h2 className="jumbotron-heading">Auth ors Database</h2>
        </div>
        <Col className="jumbotron jumbotron-header rounded mb-4 p-4">
          <h2 className="text-primary">
            Filter Authors Database by First Name
          </h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Form inline onSubmit={handleSubmit}>
            <Row>
              <Col>
                <FormGroup className="me-2">
                  <Input
                    type="search"
                    placeholder="First Name"
                    value={searchTerm}
                    onChange={handleChange}
                    className="form-control"
                  />
                </FormGroup>
              </Col>
              <Col>
                <Button className="btn-ll5" onClick={handleClear}>
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      {searchData.length > 0 && (
        <Row>
          <Col>
            <div className="table-responsive shadow-sm rounded ">
              <table className="table table-striped table-hover shadow-sm rounded">
                <thead className="table-dark">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Search;
