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
  greenCell: {
    backgroundColor: "lightgreen",
  },
  blueCell: {
    backgroundColor: "lightblue",
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

  function compareChannels(a, b) {
    const channelsA = a.tv ? (a.tv.channels_hd || 0) : 0;
    const channelsB = b.tv ? (b.tv.channels_hd || 0) : 0;
    return channelsB - channelsA;
}

  const tariffsData = tariffs?.data?.tariffs?.data || [];
  const sortedTariffs = tariffsData.slice().sort(compareChannels);  

  const handleChange = (event) => {
    const foundProvider = providersData.find(
      (x) => x.id === +event.target.value,
    );
    if (foundProvider) {
      setCurrentProvider(foundProvider);
    }
  };

  const bestTariffs = [];
  const findTariffs = (field) => {
    if(field === "internet"){
      const maxFieldValue = Math.max(
        ...tariffsData.map((e) => e[field]?.speed_in || 0),
      );
      bestTariffs.push(
        {
          name: "Лучшая скорость",
          value: tariffsData.map((e) => {
            if(e[field]?.speed_in === maxFieldValue){
              return e.name
            }
            return 0
          }).filter((e) => e)
        }
      );
      return tariffsData.filter((e) => (e[field]?.speed_in || 0) === maxFieldValue);
    }
    if(field === "displayPrice"){
      const minFieldValue = Math.min(
        ...tariffsData.map((e) => e[field] || 0),
      );
      bestTariffs.push(
        {
          name: "Лучшая цена",
          value: tariffsData.map((e) => {
            if(e[field] === minFieldValue){
              return e.name
            }
            return 0
          }).filter((e) => e)
        }
        );
      return tariffsData.filter((e) => (e[field] || 0) === minFieldValue);
    }
    const maxFieldValue = Math.max(
      ...tariffsData.map((e) => e[field]?.channels || 0),
    );
    bestTariffs.push(
      {
        name: "Больше каналов",
        value: tariffsData.map((e) => {
          if(e[field]?.channels === maxFieldValue){
            return e.name
          }
          return 0
        }).filter((e) => e)
      }
    );
    return tariffsData.filter((e) => (e[field]?.channels || 0) === maxFieldValue);
  };

  const findTariffsHD = (field) => {
    const maxFieldValue = Math.max(...tariffsData.map((e) => e[field]?.channels_hd || 0));
    const channelsHD = tariffsData.map((e) => {
      if(e[field]?.channels_hd === maxFieldValue && maxFieldValue){
        console.log(e[field]?.channels_hd)
        return e.name
      }
      return 0
    }).filter((e) => e);
    bestTariffs.push(
      {
        name: "Больше HD каналов",
        value: channelsHD.length ? channels : ["-"]
      }
    );
    return tariffsData.filter((e) => (e[field]?.channels_hd || 0) === maxFieldValue)
  }

  const price = findTariffs("displayPrice");
  const internetSpeed = findTariffs("internet");
  const channels = findTariffs("tv");
  const channelsHD = findTariffsHD("tv");
  
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
              <TableCell>Цена</TableCell>
              <TableCell>Скорость интернета</TableCell>
              <TableCell>Количество телеканалов</TableCell>
              <TableCell>Количество HD-телеканалов</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTariffs.map((tariff) => (
              <TableRow key={tariff.id}>
                <TableCell component="th" scope="row">
                  {tariff.name}
                </TableCell>
                <TableCell
                  className={
                    price.find((e) => e.id === tariff.id)
                      ? classes.greenCell
                      : price.length > 1 &&
                      price.find((e) => e.displayPrice === tariff.displayPrice)
                      ? classes.blueCell
                      : ""
                  }
                >
                  {tariff.displayPrice || "-"}
                </TableCell>
                <TableCell
                  className={
                    internetSpeed.find((e) => e.id === tariff.id)
                      ? classes.blueCell
                      : internetSpeed.length > 1 &&
                        internetSpeed.find((e) => e.internet.speed_in === tariff.internet.speed_in)
                      ? classes.greenCell
                      : ""
                  }
                >
                  {tariff.internet.speed_in || "-"}
                </TableCell>
                <TableCell
                  className={
                    channels.find((e) => e.id === tariff.id) ? classes.blueCell : channels.length > 1 &&
                      channels.find((e) => e.tv?.channels === tariff.tv?.channels)
                      ? classes.greenCell
                      : ""
                  }
                >
                  {tariff.tv?.channels || "-"}
                </TableCell>
                <TableCell
                  className={
                    channelsHD.find((e) => e.id === tariff.id) && tariff.tv?.channels_hd
                      ? classes.blueCell
                      : channelsHD.length > 1 &&
                      channelsHD.find((e) => e.tv?.channels_hd === tariff.tv?.channels_hd)
                      ? classes.greenCell && tariff.tv?.channels_hd
                      : ""
                  }
                >
                  {tariff.tv?.channels_hd || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer >
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {bestTariffs.map((e) => (
              <TableRow>
                <TableCell>{e.name}</TableCell>
                <TableCell align="left">
                  {e.value.join(", ")}
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
