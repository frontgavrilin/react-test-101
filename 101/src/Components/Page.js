import { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PROVIDERS_QUERY } from "../Queries/providersQuery";
import { TARIFFS_QUERY } from "../Queries/tariffsQuery";

const REGION_URL = "moskva";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 300,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  menuPaper: {
    maxHeight: 500,
  },
}));

function Page() {
  const classes = useStyles();

  const [currentProvider, setCurrentProvider] = useState({});

  const providers = useQuery(PROVIDERS_QUERY, {
    variables: {
      filter: `region.url=${REGION_URL}`,
      limit: 50,
      offset: 0,
      sort: "name",
    },
  });
  const providersData = providers?.data?.providers?.data || [];

  const tariffs = useQuery(TARIFFS_QUERY, {
    skip: !currentProvider?.id,
    variables: {
      filter: `region.url=${REGION_URL}&provider.url_name=${currentProvider.url_name}`,
      limit: 100,
      offset: 0,
      sort: "name",
    },
  });
  const tariffsData = tariffs?.data?.tariffs?.data || [];

  const handleChange = (event) => {
    const foundProvider = providersData.find(
      (x) => x.id === +event.target.value,
    );
    if (foundProvider) {
      setCurrentProvider(foundProvider);
    }
  };

  return (
    <Container>
      <Typography variant="h3" component="h2">
        Таблица сравнения
      </Typography>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="provider-select-label">Провайдер</InputLabel>
        <Select
          labelId="provider-select-label"
          id="provider-select"
          value={currentProvider?.id || 0}
          onChange={handleChange}
          label="Provider"
          MenuProps={{ classes: { paper: classes.menuPaper } }}
        >
          <MenuItem value="0">
            <em>None</em>
          </MenuItem>
          {providersData
            .filter((x) => x.info.cnt_tariffs > 0)
            .map((provider) => (
              <MenuItem key={provider.id} value={provider.id}>
                {provider.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название тарифа</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tariffsData.map((tariff) => (
              <TableRow key={tariff.id}>
                <TableCell component="th" scope="row">
                  {tariff.name}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Page;
