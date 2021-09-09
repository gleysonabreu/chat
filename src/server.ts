import { serverHttp } from './app';
import './sockets';

serverHttp.listen(process.env.PORT || 3333, () => {
  console.log(`Server running on port ${process.env.PORT || 3333}`);
});