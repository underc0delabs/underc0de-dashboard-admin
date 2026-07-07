import { useMemo } from "react";
import { RaffleActions } from "../../core/actions/raffleActions";
import { RafflePresenter } from "./rafflePresenter";
import type { IRaffleViews } from "../../core/presentation/iRafflePresenter";
import { useDependency } from "@/hooks/useDependency";
import type { IRaffleGateway } from "../gateways/HttpRaffleGateway";

export const rafflePresenterProvider = (views: IRaffleViews) => {
  const gateway = useDependency<IRaffleGateway>("raffleGateway");
  return useMemo(
    () => RafflePresenter(RaffleActions(gateway), views),
    [gateway, views],
  );
};
